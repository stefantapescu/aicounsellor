import { checkAPILimitStatus, updateOccupationProjections } from './fetch-projections';
import { updateOccupationWages } from './fetch-bls-data';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DataUpdateStatus {
  lastUpdate: string;
  totalOccupations: number;
  updatedOccupations: number;
  successRate: number;
  errors: Record<string, number>;
}

async function getDataUpdateStatus(): Promise<DataUpdateStatus> {
  const { data: occupations, error } = await supabase
    .from('occupations')
    .select('code, last_updated')
    .order('last_updated', { ascending: false });

  if (error) throw error;

  const updatedOccupations = occupations.filter(occ => occ.last_updated).length;
  const successRate = (updatedOccupations / occupations.length) * 100;

  return {
    lastUpdate: occupations[0]?.last_updated || 'Never',
    totalOccupations: occupations.length,
    updatedOccupations,
    successRate: parseFloat(successRate.toFixed(1)),
    errors: {} // This would need to be populated from error logs
  };
}

async function printStatus() {
  try {
    const status = await getDataUpdateStatus();
    console.log('\n=== BLS Data Update Status ===');
    console.log(`Last Update: ${status.lastUpdate}`);
    console.log(`Total Occupations: ${status.totalOccupations}`);
    console.log(`Updated Occupations: ${status.updatedOccupations}`);
    console.log(`Success Rate: ${status.successRate}%`);
    console.log('=============================\n');
  } catch (error) {
    console.error('Error getting status:', error);
  }
}

async function checkEnvironment() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'BLS_API_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:');
    missingVars.forEach(varName => console.error(`- ${varName}`));
    console.log('\nPlease add these variables to your .env.local file');
    return false;
  }
  
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  if (!await checkEnvironment()) {
    process.exit(1);
  }

  switch (command) {
    case 'status':
      await printStatus();
      break;

    case 'check-limit':
      await checkAPILimitStatus();
      break;

    case 'update-all':
      console.log('Starting complete BLS data update...');
      await updateOccupationWages();
      await updateOccupationProjections();
      await printStatus();
      break;

    case 'update-wages':
      console.log('Starting wage data update...');
      await updateOccupationWages();
      await printStatus();
      break;

    case 'update-projections':
      console.log('Starting employment projections update...');
      await updateOccupationProjections();
      await printStatus();
      break;

    case 'resume-projections':
      console.log('Resuming employment projections update...');
      await updateOccupationProjections(true);
      await printStatus();
      break;

    case 'help':
    default:
      console.log(`
BLS Data Manager - Available Commands:

  status              Show current data update status
  check-limit         Check BLS API quota availability
  update-all          Update both wage and projections data
  update-wages        Update only wage data
  update-projections  Update only employment projections
  resume-projections  Resume a previously interrupted projections update
  help               Show this help message

Environment Variables Required:
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - BLS_API_KEY

Example Usage:
  npm run bls status
  npm run bls check-limit
  npm run bls update-all
  npm run bls update-wages
  npm run bls update-projections
  npm run bls resume-projections
`);
      break;
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
} 