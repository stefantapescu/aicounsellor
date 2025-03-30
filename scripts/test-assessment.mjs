// Basic script to test assessment server actions.
// WARNING: This might fail as Server Actions rely on Next.js context (cookies, etc.)
// which is not present when run directly via Node. A proper E2E test
// using Playwright or Cypress is recommended for full UI flow testing.

import { saveVocationalResponse, generateAndSaveAssessmentAnalysis } from '../src/app/assessment/actions.js';

// --- Configuration ---
// IMPORTANT: Replace with a valid USER ID from your Supabase auth.users table
// You might need to sign up a user manually first if the DB was reset.
const TEST_USER_ID = 'REPLACE_WITH_VALID_USER_ID';
const ASSESSMENT_ID = 'main_vocational';
// ---

if (TEST_USER_ID === 'REPLACE_WITH_VALID_USER_ID') {
  console.error("Please replace 'REPLACE_WITH_VALID_USER_ID' with an actual user ID in the script.");
  process.exit(1);
}

// Dummy data simulating user input
const dummyResponses = {
  interests: {
    interest_build: 3,
    interest_repair: 4,
    interest_research: 5,
    interest_analyze: 4,
    interest_design: 2,
    interest_write: 1,
    interest_teach: 3,
    interest_counsel: 4,
    interest_lead: 5,
    interest_sell: 2,
    interest_organize: 3,
    interest_manage: 4,
  },
  skills: {
    skill_problem_solving: 4,
    skill_communication: 3,
    skill_teamwork: 4,
    skill_creativity: 2,
    skill_leadership: 3,
    skill_technical: 5,
    skill_organization: 4,
    skill_detail: 3,
  },
  values: {
    value_achievement: 5,
    value_independence: 4,
    value_recognition: 3,
    value_relationships: 4,
    value_support: 5,
    value_working_conditions: 3,
    value_variety: 4,
    value_security: 5,
    value_helping_others: 2,
    value_creativity: 3,
  },
  open_ended_goals: {
    goals: "My short-term goal is to learn more about software development. Long-term, I want to lead a tech team.",
  },
};

async function runTest() {
  console.log(`Starting assessment test for user: ${TEST_USER_ID}`);

  try {
    // 1. Save responses for each section
    console.log("Attempting to save responses...");
    for (const [sectionId, responseData] of Object.entries(dummyResponses)) {
      console.log(` - Saving section: ${sectionId}`);
      const saveResult = await saveVocationalResponse({
        userId: TEST_USER_ID,
        sectionId: sectionId,
        responseData: responseData,
        assessmentId: ASSESSMENT_ID,
      });
      if (saveResult.error) {
        throw new Error(`Failed to save section ${sectionId}: ${saveResult.error}`);
      }
      console.log(`   Section ${sectionId} saved.`);
      // Add a small delay between saves if needed
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    console.log("All responses saved successfully.");

    // 2. Trigger analysis
    console.log("Attempting to generate analysis...");
    const analysisResult = await generateAndSaveAssessmentAnalysis(TEST_USER_ID, ASSESSMENT_ID);

    if (analysisResult.error) {
       throw new Error(`Analysis generation/saving failed: ${analysisResult.error}`);
    }

    console.log("Analysis generated and saved successfully!");
    console.log("Result:", analysisResult.analysis);
    console.log("\nTEST COMPLETED SUCCESSFULLY.");

  } catch (error) {
    console.error("\n--- ASSESSMENT TEST FAILED ---");
    console.error(error.message);
    console.error("NOTE: This script runs actions outside the Next.js context, which might cause failures related to authentication or client creation.");
    process.exit(1);
  }
}

runTest();
