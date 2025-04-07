import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { OpenAI } from 'openai';
import { SimulationStep, CareerScenario } from '@/types/simulations';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { SupabaseClient } from '@supabase/supabase-js'; // Import SupabaseClient type

// Use the OpenAI Node.js SDK for better JSON support
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Removed unused ScenarioTemplate type definition

// Function to ensure required tables exist
async function ensureTablesExist(supabase: SupabaseClient) { // Use SupabaseClient type
  try {
    // Check if career_scenarios table exists
    const { error: checkError } = await supabase.from('career_scenarios').select('id').limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      // Table doesn't exist, read the migration file and execute it
      const migrationFilePath = path.join(process.cwd(), 'migrations', 'career_simulations.sql');
      let sql;
      
      try {
        // Try to read the migration file
        sql = fs.readFileSync(migrationFilePath, 'utf8');
      } catch (readError) {
        console.error('Error reading migration file:', readError);
        // Fallback to hardcoded SQL if file cannot be read
        sql = `
          -- Create career_scenarios table
          CREATE TABLE IF NOT EXISTS career_scenarios (
            id UUID PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            onet_code TEXT NOT NULL,
            difficulty_level TEXT NOT NULL,
            estimated_duration_minutes INTEGER NOT NULL,
            points_reward INTEGER NOT NULL,
            steps JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
          );

          -- Create user_scenario_progress table
          CREATE TABLE IF NOT EXISTS user_scenario_progress (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            scenario_id UUID NOT NULL REFERENCES career_scenarios(id) ON DELETE CASCADE,
            current_step INTEGER NOT NULL DEFAULT 0,
            completed BOOLEAN NOT NULL DEFAULT false,
            completed_steps TEXT[] NOT NULL DEFAULT '{}',
            started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            UNIQUE(user_id, scenario_id)
          );

          -- Create RLS policies for career_scenarios
          ALTER TABLE career_scenarios ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "Public read access" ON career_scenarios FOR SELECT USING (true);
          CREATE POLICY "Admin insert/update/delete" ON career_scenarios FOR ALL USING (
            auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.jwt() ->> 'role' = 'service_role')
          );

          -- Create RLS policies for user_scenario_progress
          ALTER TABLE user_scenario_progress ENABLE ROW LEVEL SECURITY;
          CREATE POLICY "Users can view own progress" ON user_scenario_progress FOR SELECT USING (
            auth.uid() = user_id
          );
          CREATE POLICY "Users can insert own progress" ON user_scenario_progress FOR INSERT WITH CHECK (
            auth.uid() = user_id
          );
          CREATE POLICY "Users can update own progress" ON user_scenario_progress FOR UPDATE USING (
            auth.uid() = user_id
          );
        `;
      }

      // Try to execute the SQL
      const { error: createError } = await supabase.rpc('exec_sql', { sql });
      if (createError) {
        console.error('Error creating tables:', createError);
        throw createError;
      }
    }
  } catch (error) {
    console.error('Error ensuring tables exist:', error);
    // We'll continue even if this fails, and let the actual operation handle any remaining issues
  }
}

export async function POST(request: Request) {
  try {
    const { onetCode, occupationTitle } = await request.json(); // Removed occupationDescription

    if (!onetCode || !occupationTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Ensure necessary tables exist before proceeding
    try {
      await ensureTablesExist(supabase);
    } catch (error) {
      console.error("Failed to ensure tables exist:", error);
      return NextResponse.json(
        { error: 'Database setup error. Please try again.' },
        { status: 500 }
      );
    }

    // Get the authenticated user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the occupation exists
    const { data: occupation, error: occupationError } = await supabase
      .from('occupations')
      .select('code')
      .eq('code', onetCode)
      .single();

    if (occupationError || !occupation) {
      return NextResponse.json(
        { error: 'Invalid occupation code' },
        { status: 400 }
      );
    }

    // Check for existing scenarios
    try {
      const { data: existingScenarios, error: fetchError } = await supabase
        .from('career_scenarios')
        .select('*')
        .eq('onet_code', onetCode)
        .limit(1);

      if (!fetchError && existingScenarios && existingScenarios.length > 0) {
        // Return existing scenario
        const scenario = existingScenarios[0];

        // Create progress record if it doesn't exist
        try {
          const { error: progressError } = await supabase
            .from('user_scenario_progress')
            .upsert({
              id: crypto.randomUUID(),
              user_id: user.id,
              scenario_id: scenario.id,
              current_step: 0,
              completed: false,
              completed_steps: [],
              started_at: new Date().toISOString(),
              last_activity_at: new Date().toISOString()
            })
            .select()
            .single();

          if (progressError && progressError.code !== '23505') { // Ignore unique constraint violations
            console.error('Error creating progress:', progressError);
            // Continue even if there's an error with progress
          }
        } catch (progressError) {
          console.error('Error creating user progress:', progressError);
          // Continue anyway, as we can still return the scenario
        }

        return NextResponse.json(scenario);
      }
    } catch (error) {
      console.error('Error checking for existing scenarios:', error);
      // Don't return an error here, continue to generate a new scenario
    }

    // Generate a new scenario
    console.log("Generating new scenario for occupation:", onetCode);
    
    // Generate a structured scenario with specific step types
    const scenarioSteps: SimulationStep[] = [];
    
    // Step 1: Knowledge Assessment (Quiz with 10 questions)
    const quizPrompt = `Create a knowledge assessment quiz about the role of a ${occupationTitle}.
    The quiz should test knowledge of key responsibilities, skills, and common scenarios in this profession.
    
    Create exactly 10 questions, each with 4 answer options and only one correct answer.
    
    Format as JSON with this structure:
    {
      "questions": [
        {
          "id": "q1",
          "text": "Question text here",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": 0 // Index of correct answer (0-3)
        },
        // 9 more questions...
      ]
    }
    
    Make questions realistic and challenging enough to test actual job knowledge.`;

    const quizCompletion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert career educator who creates realistic job assessments."
        },
        {
          role: "user",
          content: quizPrompt
        }
      ],
      response_format: { type: "json_object" }
    });

    if (quizCompletion.choices[0].message.content) {
      const quizContent = JSON.parse(quizCompletion.choices[0].message.content);
      scenarioSteps.push({
        id: `step-quiz-${crypto.randomUUID()}`,
        type: 'quiz' as const,
        title: 'Knowledge Assessment',
        description: `Test your knowledge about what ${occupationTitle}s do in their daily work.`,
        content: quizContent,
        sequence_number: 0
      });
    }

    // Step 2: First Job Simulation (Interactive Task)
    const task1Prompt = `Create an interactive job simulation task for a ${occupationTitle}.
    
    This should represent a common, realistic scenario they would face in their job that involves 
    decision-making and job-specific knowledge.
    
    Format as JSON with this structure:
    {
      "tasks": [
        {
          "id": "task1",
          "text": "Detailed description of the task and what the user should consider",
          "hint": "Optional hint to guide the user"
        },
        {
          "id": "task2",
          "text": "Detailed description of a follow-up task",
          "hint": "Optional hint to guide the user"
        },
        // Add 3-5 related tasks that build on each other
      ]
    }
    
    Make the tasks specific to ${occupationTitle}s, practical, and representative of real job situations.`;

    const task1Completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert job training developer who creates realistic work simulations."
        },
        {
          role: "user",
          content: task1Prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    if (task1Completion.choices[0].message.content) {
      const task1Content = JSON.parse(task1Completion.choices[0].message.content);
      scenarioSteps.push({
        id: `step-task1-${crypto.randomUUID()}`,
        type: 'interactive_task' as const,
        title: 'Job Simulation: Common Scenario',
        description: `Experience a typical scenario that ${occupationTitle}s face in their work.`,
        content: task1Content,
        sequence_number: 1
      });
    }

    // Step 3: Second Job Simulation (Interactive Task - more complex)
    const task2Prompt = `Create a more complex interactive job simulation task for a ${occupationTitle}.
    
    This should represent a challenging, realistic scenario they would face in their job that involves 
    problem-solving, critical thinking, and advanced job-specific knowledge.
    
    Format as JSON with this structure:
    {
      "tasks": [
        {
          "id": "task1",
          "text": "Detailed description of the complex task and what the user should consider",
          "hint": "Optional hint to guide the user"
        },
        {
          "id": "task2",
          "text": "Detailed description of a follow-up task",
          "hint": "Optional hint to guide the user"
        },
        // Add 3-5 related tasks that build on each other
      ]
    }
    
    Make the tasks challenging, specific to ${occupationTitle}s, and representative of difficult but realistic job situations.`;

    const task2Completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert job training developer who creates realistic work simulations."
        },
        {
          role: "user",
          content: task2Prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    if (task2Completion.choices[0].message.content) {
      const task2Content = JSON.parse(task2Completion.choices[0].message.content);
      scenarioSteps.push({
        id: `step-task2-${crypto.randomUUID()}`,
        type: 'interactive_task' as const,
        title: 'Job Simulation: Complex Challenge',
        description: `Tackle a challenging scenario that experienced ${occupationTitle}s encounter in their career.`,
        content: task2Content,
        sequence_number: 2
      });
    }

    // Step 4: Reflection (Final reflection)
    const reflectionPrompt = `Create a set of reflection prompts for someone considering a career as a ${occupationTitle}.
    
    These prompts should help them reflect on whether this career is a good fit for them based on their skills, interests, and values.
    
    Format as JSON with this structure:
    {
      "prompts": [
        {
          "id": "reflection1",
          "text": "Detailed reflection question about career fit",
          "minWords": 50,
          "example": "Optional example response to guide the user"
        },
        // Add 2-3 more meaningful reflection prompts
      ]
    }
    
    Make the prompts thought-provoking and specific to the ${occupationTitle} role.`;

    const reflectionCompletion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert career counselor who helps people reflect on career choices."
        },
        {
          role: "user",
          content: reflectionPrompt
        }
      ],
      response_format: { type: "json_object" }
    });

    if (reflectionCompletion.choices[0].message.content) {
      const reflectionContent = JSON.parse(reflectionCompletion.choices[0].message.content);
      scenarioSteps.push({
        id: `step-reflection-${crypto.randomUUID()}`,
        type: 'reflection' as const,
        title: 'Career Reflection',
        description: `Reflect on what you've learned about being a ${occupationTitle} and whether this career might be right for you.`,
        content: reflectionContent,
        sequence_number: 3
      });
    }

    // Generate metadata for the overall scenario
    const metadataPrompt = `Create metadata for a career simulation about being a ${occupationTitle}.
    
    Format as JSON with this structure:
    {
      "title": "A catchy, professional title for the simulation",
      "description": "A 1-2 sentence description of what the user will learn",
      "difficulty_level": "beginner", // One of: beginner, intermediate, advanced
      "estimated_duration_minutes": 30, // Realistic estimate between 20-60
      "points_reward": 100 // A number between 50-150
    }
    
    Make the metadata accurate and professional.`;

    const metadataCompletion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert curriculum designer who creates engaging learning experiences."
        },
        {
          role: "user",
          content: metadataPrompt
        }
      ],
      response_format: { type: "json_object" }
    });

    let metadata: {
      title: string;
      description: string;
      difficulty_level: "beginner" | "intermediate" | "advanced";
      estimated_duration_minutes: number;
      points_reward: number;
    } = {
      title: `A Day in the Life of a ${occupationTitle}`,
      description: `Experience what it's like to work as a ${occupationTitle} through this interactive simulation.`,
      difficulty_level: "beginner",
      estimated_duration_minutes: 30,
      points_reward: 100
    };

    if (metadataCompletion.choices[0].message.content) {
      const parsedMetadata = JSON.parse(metadataCompletion.choices[0].message.content);
      
      // Validate difficulty level
      let difficultyLevel: "beginner" | "intermediate" | "advanced" = "beginner";
      if (
        parsedMetadata.difficulty_level === "beginner" || 
        parsedMetadata.difficulty_level === "intermediate" || 
        parsedMetadata.difficulty_level === "advanced"
      ) {
        difficultyLevel = parsedMetadata.difficulty_level;
      }
      
      metadata = {
        title: parsedMetadata.title || metadata.title,
        description: parsedMetadata.description || metadata.description,
        difficulty_level: difficultyLevel,
        estimated_duration_minutes: parsedMetadata.estimated_duration_minutes || metadata.estimated_duration_minutes,
        points_reward: parsedMetadata.points_reward || metadata.points_reward
      };
    }

    // Create the full scenario with all components
    const scenario: CareerScenario = {
      ...metadata,
      id: crypto.randomUUID(),
      onet_code: onetCode,
      steps: scenarioSteps,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to database
    const { error: insertError } = await supabase
      .from('career_scenarios')
      .insert([scenario])
      .select()
      .single();

    if (insertError) {
      console.error('Error saving scenario:', insertError);
      return NextResponse.json(
        { error: `Failed to save scenario: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Create initial progress record
    const { error: progressError } = await supabase
      .from('user_scenario_progress')
      .insert([{
        id: crypto.randomUUID(),
        user_id: user.id,
        scenario_id: scenario.id,
        current_step: 0,
        completed: false,
        completed_steps: [],
        started_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (progressError) {
      console.error('Error creating progress:', progressError);
      // Don't fail the request if progress creation fails
      // The user can still access the scenario
    }

    return NextResponse.json(scenario);
  } catch (error) {
    console.error('Error generating scenario:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate scenario' },
      { status: 500 }
    );
  }
}
