import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const BLS_API_URL = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';

interface BLSResponse {
  status: string;
  responseTime: number;
  message?: string[];
  Results: {
    series: Array<{
      seriesID: string;
      data: Array<{
        year: string;
        period: string;
        periodName: string;
        value: string;
        footnotes: Array<{
          code: string;
          text: string;
        }>;
      }>;
    }>;
  };
}

// Map O*NET-SOC codes to BLS SOC codes (they're similar but not identical)
function mapOnetToBLSCode(onetCode: string): string {
  // O*NET uses more detailed codes (8 digits) while BLS uses 6 digits
  // Example: O*NET 11-1011.00 maps to BLS 11-1011
  return onetCode.substring(0, 7);
}

async function fetchWageData(socCode: string): Promise<{
  median: number;
  range: { low: number; high: number };
} | null> {
  try {
    // BLS series IDs for different wage percentiles
    // OEUN = Occupational Employment and Wage Statistics, National
    const seriesIds = [
      `OEUN${socCode}10`, // 10th percentile
      `OEUN${socCode}50`, // Median (50th percentile)
      `OEUN${socCode}90`, // 90th percentile
    ];

    const response = await axios.post<BLSResponse>(
      BLS_API_URL,
      {
        seriesid: seriesIds,
        startyear: new Date().getFullYear() - 1, // Last year's data
        endyear: new Date().getFullYear() - 1,
        registrationkey: process.env.BLS_API_KEY,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status !== 'REQUEST_SUCCEEDED') {
      console.error(`BLS API error for ${socCode}:`, response.data.message);
      return null;
    }

    const wages = {
      median: 0,
      range: {
        low: 0,
        high: 0,
      },
    };

    response.data.Results.series.forEach((series) => {
      if (!series.data?.[0]?.value) return;

      const value = parseFloat(series.data[0].value) * 1000; // BLS values are in thousands
      if (series.seriesID.endsWith('10')) {
        wages.range.low = value;
      } else if (series.seriesID.endsWith('50')) {
        wages.median = value;
      } else if (series.seriesID.endsWith('90')) {
        wages.range.high = value;
      }
    });

    return wages;
  } catch (error) {
    console.error(`Error fetching wage data for ${socCode}:`, error);
    return null;
  }
}

export async function updateOccupationWages() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all occupation codes from the database
    const { data: occupations, error } = await supabase
      .from('occupations')
      .select('code');

    if (error) {
      throw error;
    }

    console.log(`Updating wage data for ${occupations.length} occupations...`);

    // Process occupations in batches to avoid rate limits
    const BATCH_SIZE = 10;
    const DELAY_BETWEEN_BATCHES = 5000; // 5 seconds

    for (let i = 0; i < occupations.length; i += BATCH_SIZE) {
      const batch = occupations.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        batch.map(async (occupation) => {
          const blsCode = mapOnetToBLSCode(occupation.code);
          const wages = await fetchWageData(blsCode);

          if (wages) {
            const { error: updateError } = await supabase
              .from('occupations')
              .update({
                wages: {
                  ...wages,
                  currency: 'USD',
                },
                updated_at: new Date().toISOString(),
              })
              .eq('code', occupation.code);

            if (updateError) {
              console.error(`Error updating wages for ${occupation.code}:`, updateError);
            } else {
              console.log(`Successfully updated wages for ${occupation.code}`);
            }
          }
        })
      );

      if (i + BATCH_SIZE < occupations.length) {
        console.log(`Waiting ${DELAY_BETWEEN_BATCHES / 1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    console.log('Wage data update completed!');
  } catch (error) {
    console.error('Error during wage data update:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  updateOccupationWages();
} 