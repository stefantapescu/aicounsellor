#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuration ---
// Load environment variables from .env.local located in the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..'); // Assumes script is in /scripts directory
dotenv.config({ path: path.resolve(projectRoot, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for backend operations
const onetUsername = process.env.ONET_USERNAME; // Added Username
const onetApiKey = process.env.ONET_API_KEY; // This acts as the password
const onetApiBaseUrl = 'https://services-beta.onetcenter.org/ws/v2/'; // Corrected V2 BETA base URL

if (!supabaseUrl || !supabaseServiceKey || !onetUsername || !onetApiKey) {
  console.error('Error: Missing required environment variables (Supabase URL/Service Key, O*NET Username, O*NET API Key).');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- O*NET API Interaction ---
async function fetchOnetData(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(endpoint, onetApiBaseUrl);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  console.log(`Fetching O*NET data from: ${url.toString()}`);

  try {
    // Using fetch API (available in Node.js 18+)
    // Use Basic Authentication for O*NET V2 API
    const credentials = Buffer.from(`${onetUsername}:${onetApiKey}`).toString('base64');
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`, // Basic Auth header
        'Accept': 'application/json', // Request JSON response
      },
    });

    if (!response.ok) {
      throw new Error(`O*NET API request failed with status ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched data for endpoint: ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`Error fetching O*NET data from ${endpoint}:`, error);
    throw error; // Re-throw to handle in main function
  }
}

// --- Data Processing & Insertion ---

// Helper function to safely access nested properties
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
const getSafe = (obj: any, path: string, defaultValue: any = null) => { // Keep any for obj/defaultValue for now
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return path.split('.').reduce((acc: any, key: string) => (acc && acc[key] !== undefined && acc[key] !== null) ? acc[key] : defaultValue, obj);
};

// REMOVED unused function: processAndInsertCareers
// REMOVED unused function: ensureSkillsExist


// Function to process the detailed report for a single occupation and update its entry
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processAndInsertCareerDetails(onetCode: string, detailsData: any) { // Renamed back
  console.log(`Processing details for career ${onetCode}...`);
  if (!detailsData || !onetCode) return;

  // --- Determine RIASEC Code ---
  let primaryRiasecCode: string | null = null;
  const interests = getSafe(detailsData, 'interests.interest', []); // Get the array of interests
  if (Array.isArray(interests) && interests.length > 0) {
    let highestScore = -1;
    // Find the interest element with the highest score
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interests.forEach((interest: any) => {
      const score = parseFloat(getSafe(interest, 'score', -1)); // Assuming score is nested
      const name = getSafe(interest, 'name', ''); // Get the interest name (e.g., "Realistic")
      if (score > highestScore && name) {
        highestScore = score;
        // Map full name to single letter code
        const nameLower = name.toLowerCase();
        if (nameLower.includes('realistic')) primaryRiasecCode = 'R';
        else if (nameLower.includes('investigative')) primaryRiasecCode = 'I';
        else if (nameLower.includes('artistic')) primaryRiasecCode = 'A';
        else if (nameLower.includes('social')) primaryRiasecCode = 'S';
        else if (nameLower.includes('enterprising')) primaryRiasecCode = 'E';
        else if (nameLower.includes('conventional')) primaryRiasecCode = 'C';
        else primaryRiasecCode = null; // Reset if name doesn't match known types
      }
    });
    console.log(`Determined primary RIASEC code for ${onetCode}: ${primaryRiasecCode} (Score: ${highestScore})`);
  } else {
      console.log(`No detailed interest data found for ${onetCode} to determine RIASEC code.`);
  }

  // --- Update Core Career Info ---
  const careerUpdateData: Record<string, any> = {
      riasec_code: primaryRiasecCode, // Use the determined code
      // TODO: Update these paths based on the actual report structure logged previously
      job_outlook: getSafe(detailsData, 'outlook.bright_outlook.0'), // Example path - VERIFY THIS PATH
      typical_education_level: getSafe(detailsData, 'education.education_level.0'), // Example path - VERIFY THIS PATH
      salary_range_low: getSafe(detailsData, 'wages.national_median_wage'), // Example - VERIFY THIS PATH
      salary_range_high: getSafe(detailsData, 'wages.national_90th_percentile_wage'), // Example
  };
  // Use '_' for unused key and disable warning
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validCareerUpdates = Object.fromEntries(Object.entries(careerUpdateData).filter(([_, v]) => v !== null)); // Keep _ for unused key

  if (Object.keys(validCareerUpdates).length > 0) {
      const { error: updateError } = await supabase
          .from('occupations') // Correct table name
          .update(validCareerUpdates)
          .eq('code', onetCode); // Correct column name
      if (updateError) console.error(`Error updating occupation ${onetCode}:`, updateError);
      else console.log(`Updated core details for occupation ${onetCode}.`);
  }

  // --- Remove clearing of old detail tables ---
  // The migration already dropped these tables. The new schema uses JSONB columns.

  // --- Logic for inserting into JSONB columns (Placeholder/Example) ---
  // This part needs significant changes based on how you want to store details in JSONB.
  // The old logic inserted into separate tables. Below is just a conceptual placeholder.

  /*
  // Example: Update the 'tasks' JSONB field for the occupation
  const tasks = getSafe(detailsData, 'tasks.task', []);
  if (Array.isArray(tasks) && tasks.length > 0) {
      const tasksJsonb = tasks.map((task: any) => ({
          id: getSafe(task, 'id'), // Assuming ONET provides task IDs
          name: getSafe(task, 'name'),
          description: getSafe(task, 'description') // Assuming description exists
      })).filter(t => t.name);

      if (tasksJsonb.length > 0) {
          const { error: taskUpdateError } = await supabase
              .from('occupations')
              .update({ tasks: tasksJsonb })
              .eq('code', onetCode);
          if (taskUpdateError) console.error(`Error updating tasks JSONB for ${onetCode}:`, taskUpdateError);
          else console.log(`Updated tasks JSONB for ${onetCode}.`);
      }
  }
  */

  // --- Remove old insertion logic for separate detail tables ---
  /*
  // --- Insert Tasks ---
  const tasks = getSafe(detailsData, 'tasks.task', []);
  if (Array.isArray(tasks) && tasks.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tasksToInsert = tasks.map((task: any) => ({
      onet_code: onetCode,
      task_description: getSafe(task, 'name'),
    })).filter(t => t.task_description);
    if (tasksToInsert.length > 0) {
        const { error: taskError } = await supabase.from('career_tasks').insert(tasksToInsert);
        if (taskError) console.error(`Error inserting tasks for ${onetCode}:`, taskError);
        else console.log(`Inserted ${tasksToInsert.length} tasks for ${onetCode}.`);
    }
  }

  // --- Insert Knowledge ---
  const knowledge = getSafe(detailsData, 'knowledge.element', []);
   if (Array.isArray(knowledge) && knowledge.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const knowledgeToInsert = knowledge.map((k: any) => ({
      onet_code: onetCode,
      knowledge_area: getSafe(k, 'name'),
      importance: getSafe(k, 'importance.value'), // Example path
    })).filter(k => k.knowledge_area);
     if (knowledgeToInsert.length > 0) {
        const { error: knowledgeError } = await supabase.from('career_knowledge').insert(knowledgeToInsert);
        if (knowledgeError) console.error(`Error inserting knowledge for ${onetCode}:`, knowledgeError);
        else console.log(`Inserted ${knowledgeToInsert.length} knowledge areas for ${onetCode}.`);
     }
  }

   // --- Insert Abilities ---
   const abilities = getSafe(detailsData, 'abilities.element', []);
   if (Array.isArray(abilities) && abilities.length > 0) {
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     const abilitiesToInsert = abilities.map((a: any) => ({
       onet_code: onetCode,
       ability_name: getSafe(a, 'name'),
       importance: getSafe(a, 'importance.value'), // Example path
     })).filter(a => a.ability_name);
     if (abilitiesToInsert.length > 0) {
        const { error: abilitiesError } = await supabase.from('career_abilities').insert(abilitiesToInsert);
        if (abilitiesError) console.error(`Error inserting abilities for ${onetCode}:`, abilitiesError);
        else console.log(`Inserted ${abilitiesToInsert.length} abilities for ${onetCode}.`);
     }
   }

   // --- Insert Work Activities ---
   const activities = getSafe(detailsData, 'work_activities.element', []);
    if (Array.isArray(activities) && activities.length > 0) {
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     const activitiesToInsert = activities.map((a: any) => ({
       onet_code: onetCode,
       activity_name: getSafe(a, 'name'),
       importance: getSafe(a, 'importance.value'), // Example path
     })).filter(a => a.activity_name);
      if (activitiesToInsert.length > 0) {
        const { error: activitiesError } = await supabase.from('career_work_activities').insert(activitiesToInsert);
        if (activitiesError) console.error(`Error inserting work activities for ${onetCode}:`, activitiesError);
        else console.log(`Inserted ${activitiesToInsert.length} work activities for ${onetCode}.`);
      }
   }

   // --- Insert Work Context ---
   const contexts = getSafe(detailsData, 'work_context.element', []);
    if (Array.isArray(contexts) && contexts.length > 0) {
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     const contextsToInsert = contexts.map((c: any) => ({
       onet_code: onetCode,
       context_description: getSafe(c, 'name'), // Or description field? Adjust
     })).filter(c => c.context_description);
      if (contextsToInsert.length > 0) {
        const { error: contextError } = await supabase.from('career_work_context').insert(contextsToInsert);
        if (contextError) console.error(`Error inserting work context for ${onetCode}:`, contextError);
        else console.log(`Inserted ${contextsToInsert.length} work contexts for ${onetCode}.`);
      }
   }

   // --- Insert Skills & Link to Career ---
   const skills = getSafe(detailsData, 'skills.element', []);
   if (Array.isArray(skills) && skills.length > 0) {
       // 1. Ensure all skills exist in the 'skills' table
       const skillIdToUuidMap = await ensureSkillsExist(skills);

       // 2. Prepare links for 'career_skills' table
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       const careerSkillsToInsert = skills.map((skill: any) => {
           const onetSkillId = getSafe(skill, 'id');
           const skillUuid = skillIdToUuidMap[onetSkillId]; // Get the UUID from our map
           if (!skillUuid) return null; // Skip if skill wasn't inserted/found

           return {
               onet_code: onetCode,
               skill_id: onetSkillId, // Store O*NET's skill ID
               importance: getSafe(skill, 'importance.value'),
               level: getSafe(skill, 'level.value'),
           };
       }).filter(cs => cs !== null); // Filter out nulls

       // 3. Insert links
       // ... (Old logic for inserting into separate tables removed) ...
   }
   */
}


// --- Main Execution ---
async function main() {
  console.log('Starting O*NET data ingestion test...');

  try {
    // 1. Test fetching about endpoint (relative to new base URL)
    console.log("Attempting to fetch about endpoint...");
    const aboutResponse = await fetchOnetData('about'); // Use relative path
    console.log("About response:", JSON.stringify(aboutResponse, null, 2));

    // 2. Test fetching REPORT for a single occupation (relative to new base URL)
    const testOnetCode = '11-1011.00'; // Example: Chief Executives
    console.log(`\nAttempting to fetch REPORT for ${testOnetCode}...`);
    const detailsResponse = await fetchOnetData(`occupation/${testOnetCode}/report`); // Use relative path

    // This endpoint likely returns all details together
    if (detailsResponse) {
      console.log(`Successfully fetched report for ${testOnetCode}:`);
      console.log(JSON.stringify(detailsResponse, null, 2));

      // Call the processing function to update the single test occupation
      await processAndInsertCareerDetails(testOnetCode, detailsResponse);

    } else {
      console.warn(`Failed to fetch report for ${testOnetCode}. Check endpoint and credentials.`);
    }

    console.log('\nO*NET API test completed.');
  } catch (error) {
    console.error('\nAn error occurred during the ingestion process:', error);
    process.exit(1);
  }
}

// Run the main function
main();
