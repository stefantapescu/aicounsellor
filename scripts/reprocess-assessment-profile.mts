#!/usr/bin/env node
// Purpose: Re-process assessment data for a specific user to populate
//          assessment_summary and suggested_onet_codes in vocational_profile.
// Usage: npx tsx scripts/reprocess-assessment-profile.mts <user_id>

import { createClient } from '@supabase/supabase-js'; // Import the standard client
// Import the processing function from the new lib file
import { processAndSaveAssessmentProfile } from '../src/lib/assessment-processing.ts';

// --- Configuration ---
// Load environment variables (Supabase URL and Service Role Key are needed)
// Ensure you have SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file
// or provide them directly here (less secure).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    'Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.'
  );
  process.exit(1);
}

// Get user ID from command line arguments or use the default one
const targetUserId = process.argv[2] || '9ee85949-3f77-4dfc-9f0d-9cfef43509b9'; // Default to the confirmed ID

if (!targetUserId) {
    console.error("Error: Please provide a user ID as a command line argument.");
    console.log("Usage: node scripts/reprocess-assessment-profile.mjs <user_id>");
    process.exit(1);
}

console.log(`Attempting to re-process assessment profile for user: ${targetUserId}`);

// --- Main Execution ---
async function main() {
  // Ensure the variables are treated as strings after the check
  if (!supabaseUrl || !supabaseServiceRoleKey) {
      // This part should have already exited the process, but adding for type safety
      console.error("Environment variables check failed unexpectedly.");
      process.exit(1);
  }
  // Create a Supabase client instance using the service role key for admin privileges
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      // Explicitly disable auto-refreshing tokens for server-side/script usage
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("Supabase admin client created.");

  try {
    console.log("Calling processAndSaveAssessmentProfile from lib with admin client...");
    // Call the processing function from the lib file, passing the admin client
    const result = await processAndSaveAssessmentProfile(targetUserId, 'main_vocational', supabaseAdmin);

    if (result.error) {
      console.error(`Error re-processing profile for user ${targetUserId}:`, result.error);
      process.exitCode = 1; // Indicate failure
    } else if (result.success) {
      console.log(`Successfully re-processed and saved profile for user ${targetUserId}.`);
      console.log("Result:", result.profile); // Log the saved profile data
    } else {
        console.warn(`Profile processing completed for user ${targetUserId}, but the function returned success: false without a specific error.`);
    }
  } catch (error) {
    console.error(`Unexpected error during script execution for user ${targetUserId}:`, error);
    process.exitCode = 1; // Indicate failure
  }
}

main();
