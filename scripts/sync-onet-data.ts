import { createClient } from '@supabase/supabase-js';
import { getOnetAbout, getOnetOccupation, searchOnetOccupations } from '../src/lib/onet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface OnetSearchResult {
  occupations: Array<{
    code: string;
    title: string;
  }>;
}

async function syncAllOccupations() {
  try {
    console.log('Starting O*NET data sync...');

    // Test API connection first
    console.log('Testing API connection...');
    const aboutData = await getOnetAbout();
    console.log('API connection successful:', aboutData);

    // First, get all occupation codes
    const { data: occupations, error } = await supabase
      .from('occupations')
      .select('code');

    if (error) throw error;

    // Get existing occupation codes
    const existingCodes = new Set(occupations.map(o => o.code));

    // Search for all occupations
    const searchResults = await searchOnetOccupations('') as OnetSearchResult;
    const allOccupations = searchResults.occupations || [];

    console.log(`Found ${allOccupations.length} total occupations`);
    console.log(`Already have ${existingCodes.size} occupations in database`);

    // Process each occupation
    for (const occupation of allOccupations) {
      const code = occupation.code;
      
      // Skip if we already have this occupation
      if (existingCodes.has(code)) {
        console.log(`Skipping ${code} - already exists`);
        continue;
      }

      try {
        console.log(`Fetching details for ${code}...`);
        
        // Get detailed occupation data
        const detailedData = await getOnetOccupation(code);
        
        // Store in Supabase
        const { error: upsertError } = await supabase
          .from('occupations')
          .upsert({
            ...detailedData,
            updated_at: new Date().toISOString(),
          });

        if (upsertError) {
          console.error(`Error upserting ${code}:`, upsertError);
        } else {
          console.log(`Successfully synced ${code}`);
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing ${code}:`, error);
      }
    }

    console.log('O*NET data sync completed!');
  } catch (error) {
    console.error('Error during sync:', error);
    process.exit(1);
  }
}

// Run the sync
syncAllOccupations(); 