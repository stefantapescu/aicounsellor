// supabase/functions/analyze-dreamscapes/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://deno.land/x/openai@v4.52.7/mod.ts'; // Using Deno OpenAI library

// Define the expected structure of the incoming webhook payload from Supabase trigger
interface DreamscapesRecord {
  id: number;
  user_id: string;
  responses: {
    dreams: string[];
    subDreams: { [key: string]: { vision: string; why: string }[] };
    essayGod: string;
    essayMillion: string;
  };
  created_at: string;
  completed_at: string | null;
}

interface WebhookPayload {
  type: 'INSERT';
  table: string;
  record: DreamscapesRecord;
  schema: string;
  old_record: null | DreamscapesRecord;
}

// Define the expected structure of the analysis result from OpenAI
interface AnalysisResult {
  themes: string[];
  values: string[];
  interests: string[];
  motivators: string[];
  summary: string;
}

console.log('Analyze Dreamscapes function initializing...');

serve(async (req) => {
  try {
    // 1. Validate request and parse payload
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }
    const payload: WebhookPayload = await req.json();
    console.log('Received payload:', payload);

    if (payload.type !== 'INSERT' || !payload.record || !payload.record.responses) {
      console.error('Invalid payload structure:', payload);
      return new Response(JSON.stringify({ error: 'Invalid payload structure' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { user_id, responses } = payload.record;

    // 2. Get OpenAI API Key from environment variables (Supabase secrets)
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY environment variable not set.');
      throw new Error('OpenAI API key is not configured.');
    }

    const openai = new OpenAI({ apiKey: openAIApiKey });

    // 3. Prepare the prompt for OpenAI
    // Combine relevant parts of the responses into a single text block for analysis
    let analysisInputText = `User Dreams:\n`;
    responses.dreams.forEach((dream, i) => {
      analysisInputText += `- Dream ${i + 1}: ${dream}\n`;
      const subDreams = responses.subDreams[`dream_${i}`] || [];
      subDreams.forEach((sd, j) => {
        analysisInputText += `  - Vision ${j + 1}: ${sd.vision}\n`;
        analysisInputText += `    - Why: ${sd.why}\n`;
      });
    });
    analysisInputText += `\nEssay - God for a day:\n${responses.essayGod}\n`;
    analysisInputText += `\nEssay - Million euros:\n${responses.essayMillion}\n`;

    const systemPrompt = `You are an expert vocational analyst. Analyze the following user responses from a self-discovery workshop. Identify and list recurring themes (e.g., creativity, helping others, adventure, leadership, technical skill), core values demonstrated, potential career interests suggested by the content, and key motivators. Provide the output ONLY as a valid JSON object with the following keys: "themes" (array of strings), "values" (array of strings), "interests" (array of strings), "motivators" (array of strings), and "summary" (a brief text summary, max 100 words).`;

    const userPrompt = `Analyze these workshop responses:\n\n${analysisInputText}`;

    console.log(`Sending prompt to OpenAI for user ${user_id}...`);

    // 4. Call OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'gpt-3.5-turbo', // Or 'gpt-4' if preferred/available
      response_format: { type: "json_object" }, // Request JSON output
      temperature: 0.5, // Adjust for creativity vs consistency
    });

    const analysisContent = chatCompletion.choices[0]?.message?.content;
    console.log('Received analysis content from OpenAI:', analysisContent);

    if (!analysisContent) {
      throw new Error('No content received from OpenAI analysis.');
    }

    // 5. Parse the analysis result (expecting JSON)
    let analysisResult: AnalysisResult;
    try {
      analysisResult = JSON.parse(analysisContent);
      // Basic validation of the parsed structure
      if (!analysisResult || !Array.isArray(analysisResult.themes) || !analysisResult.summary) {
         throw new Error('Invalid JSON structure received from OpenAI.');
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw OpenAI response:', analysisContent);
      throw new Error(`Failed to parse analysis result from OpenAI: ${parseError.message}`);
    }

    console.log(`Successfully parsed analysis for user ${user_id}:`, analysisResult);

    // 6. Create Supabase client with elevated privileges
    // Use environment variables set by Supabase for Edge Functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase URL or Service Role Key not available in environment.');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
       auth: {
         // Required for admin client
         autoRefreshToken: false,
         persistSession: false
       }
    });

    // 7. Upsert the analysis into the vocational_profile table
    const { error: upsertError } = await supabaseAdmin
      .from('vocational_profile')
      .upsert(
        {
          user_id: user_id,
          dreamscapes_analysis: analysisResult, // Store the parsed JSON object
          last_updated: new Date().toISOString(),
        },
        {
          onConflict: 'user_id', // Specify the conflict target
        }
      );

    if (upsertError) {
      console.error(`Error upserting vocational profile for user ${user_id}:`, upsertError);
      throw new Error(`Failed to update vocational profile: ${upsertError.message}`);
    }

    console.log(`Successfully updated vocational profile for user ${user_id}.`);

    // 8. Return success response
    return new Response(JSON.stringify({ success: true, message: 'Analysis complete and profile updated.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in analyze-dreamscapes function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

/*
To Deploy:
1. Ensure Supabase CLI is installed and project is linked.
2. Set OpenAI secret: supabase secrets set OPENAI_API_KEY=your_actual_openai_key
3. Deploy function: supabase functions deploy analyze-dreamscapes --no-verify-jwt
4. Create DB trigger (see next migration step).
*/
