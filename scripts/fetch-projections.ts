import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import fs from 'fs';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const BLS_API_URL = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';
const MAX_RETRIES = 3;
const RETRY_DELAY = 60000; // 1 minute
const BATCH_SIZE = 5;
const BATCH_DELAY = 10000; // 10 seconds
const PROGRESS_FILE = path.join(process.cwd(), '.bls-progress.json');

interface BLSResponse {
  status: string;
  responseTime: number;
  message?: string[];
  Results?: {
    series: Array<{
      data: Array<{
        year: string;
        period: string;
        value: string;
      }>;
    }>;
  };
}

interface ProgressData {
  lastProcessedIndex: number;
  totalOccupations: number;
  lastUpdateTime: string;
  processedCodes: string[];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function mapOnetToBLSCode(onetCode: string): string {
  // Remove the detail level from O*NET-SOC code
  return onetCode.split('.')[0];
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function saveProgress(progress: ProgressData) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function loadProgress(): ProgressData | null {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading progress file:', error);
  }
  return null;
}

function clearProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
  } catch (error) {
    console.error('Error clearing progress file:', error);
  }
}

async function checkAPILimit(): Promise<boolean> {
  try {
    const response = await axios.post(BLS_API_URL, {
      registrationkey: process.env.BLS_API_KEY,
      seriesid: ['CEU0000000001'], // Using a simple series to test
      startyear: '2024',
      endyear: '2024'
    });

    return response.data.status === 'REQUEST_SUCCEEDED';
  } catch (error: any) {
    if (error.response?.data?.message?.[0]?.includes('threshold')) {
      return false;
    }
    throw error;
  }
}

async function fetchWithRetry(url: string, data: any, retries = MAX_RETRIES): Promise<BLSResponse> {
  try {
    const response = await axios.post(url, {
      ...data,
      registrationkey: process.env.BLS_API_KEY
    });
    return response.data;
  } catch (error: any) {
    if (retries > 0 && error.response?.status === 429) {
      console.log(`Rate limit hit, waiting ${RETRY_DELAY/1000} seconds before retry...`);
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, data, retries - 1);
    }
    throw error;
  }
}

async function fetchProjectionsData(socCode: string): Promise<{
  growthRate: number;
  projectedJobs: number;
  annualOpenings: number;
} | null> {
  try {
    // Get employment projections data
    const response = await fetchWithRetry(BLS_API_URL, {
      seriesid: [`EP${socCode}00000000000001`], // Employment
      startyear: '2022',
      endyear: '2032'
    });

    if (response.message?.[0]?.includes('threshold')) {
      throw new Error('API daily limit reached');
    }

    if (!response.Results?.series[0]?.data) {
      console.log(`No data found for SOC code: ${socCode}`);
      return null;
    }

    const data = response.Results.series[0].data;
    const baseYear = data.find(d => d.year === '2022')?.value || '0';
    const projYear = data.find(d => d.year === '2032')?.value || '0';
    
    const baseEmployment = parseInt(baseYear);
    const projEmployment = parseInt(projYear);
    const growthRate = ((projEmployment - baseEmployment) / baseEmployment) * 100;
    
    // Estimate annual openings (this is a simplified calculation)
    const totalChange = projEmployment - baseEmployment;
    const replacementRate = 0.03; // 3% annual replacement rate (industry average)
    const annualOpenings = Math.round((totalChange / 10) + (baseEmployment * replacementRate));

    return {
      growthRate: parseFloat(growthRate.toFixed(1)),
      projectedJobs: projEmployment,
      annualOpenings
    };
  } catch (error: any) {
    if (error.message === 'API daily limit reached') {
      throw error; // Re-throw to handle at higher level
    }
    console.error(`Error fetching data for SOC code ${socCode}:`, error.message);
    return null;
  }
}

async function processOccupationBatch(occupations: any[], progress: ProgressData) {
  for (const occupation of occupations) {
    try {
      const socCode = mapOnetToBLSCode(occupation.code);
      const projections = await fetchProjectionsData(socCode);
      
      if (projections) {
        await supabase
          .from('occupations')
          .update({
            growth_rate: projections.growthRate,
            projected_jobs: projections.projectedJobs,
            annual_openings: projections.annualOpenings,
            last_updated: new Date().toISOString()
          })
          .eq('code', occupation.code);
        
        console.log(`Updated projections for ${occupation.code}`);
        progress.processedCodes.push(occupation.code);
        saveProgress(progress);
      }
    } catch (error: any) {
      if (error.message === 'API daily limit reached') {
        throw error; // Re-throw to handle at higher level
      }
      console.error(`Error processing occupation ${occupation.code}:`, error.message);
    }
  }
}

export async function checkAPILimitStatus() {
  try {
    const hasAvailableQuota = await checkAPILimit();
    if (hasAvailableQuota) {
      console.log('BLS API quota is available. You can proceed with updates.');
    } else {
      console.log('BLS API daily limit has been reached. Please try again tomorrow.');
      const progress = loadProgress();
      if (progress) {
        console.log(`\nProgress saved at: ${progress.lastUpdateTime}`);
        console.log(`Processed: ${progress.processedCodes.length} of ${progress.totalOccupations} occupations`);
        console.log(`Last processed code: ${progress.processedCodes[progress.processedCodes.length - 1]}`);
      }
    }
  } catch (error) {
    console.error('Error checking API limit:', error);
  }
}

export async function updateOccupationProjections(resume: boolean = false) {
  try {
    // Get all occupations from Supabase
    const { data: occupations, error } = await supabase
      .from('occupations')
      .select('code')
      .order('code');

    if (error) throw error;
    if (!occupations) {
      console.log('No occupations found');
      return;
    }

    let progress: ProgressData;
    if (resume) {
      const savedProgress = loadProgress();
      if (savedProgress) {
        progress = savedProgress;
        console.log(`Resuming from previous progress (${progress.processedCodes.length} occupations processed)`);
      } else {
        progress = {
          lastProcessedIndex: 0,
          totalOccupations: occupations.length,
          lastUpdateTime: new Date().toISOString(),
          processedCodes: []
        };
      }
    } else {
      clearProgress();
      progress = {
        lastProcessedIndex: 0,
        totalOccupations: occupations.length,
        lastUpdateTime: new Date().toISOString(),
        processedCodes: []
      };
    }

    // Process occupations in batches
    for (let i = progress.lastProcessedIndex; i < occupations.length; i += BATCH_SIZE) {
      const batch = occupations.slice(i, i + BATCH_SIZE);
      try {
        await processOccupationBatch(batch, progress);
        progress.lastProcessedIndex = i + BATCH_SIZE;
        progress.lastUpdateTime = new Date().toISOString();
        saveProgress(progress);
        
        console.log(`Completed batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(occupations.length/BATCH_SIZE)}`);
        
        if (i + BATCH_SIZE < occupations.length) {
          console.log(`Waiting ${BATCH_DELAY/1000} seconds before next batch...`);
          await sleep(BATCH_DELAY);
        }
      } catch (error: any) {
        if (error.message === 'API daily limit reached') {
          console.log('\nBLS API daily limit reached. Progress has been saved.');
          console.log(`Processed: ${progress.processedCodes.length} of ${occupations.length} occupations`);
          console.log('You can resume tomorrow using: npm run update-projections -- --resume');
          return;
        }
        console.error('Error processing batch:', error);
      }
    }

    clearProgress();
    console.log('Employment projections update completed!');
  } catch (error) {
    console.error('Error updating employment projections:', error);
  }
}

// Run the update if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const resume = args.includes('--resume');
  const checkLimit = args.includes('--check-limit');

  if (checkLimit) {
    checkAPILimitStatus();
  } else {
    updateOccupationProjections(resume);
  }
} 