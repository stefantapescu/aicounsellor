import { createClient } from '@/utils/supabase/server'; // Use the project's server client utility
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { type DreamscapesAnalysis } from '@/types/profile'; // Removed unused VocationalProfile import
// Removed cookies import as it's not needed for createClient() here

// Define the structure for storing responses (matching the table)
interface DreamscapesDbRecord {
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

export async function POST() { // Removed unused 'request' parameter
  // Correct initialization for API route based on the other working route
  const supabase = await createClient();

  // 1. Get User
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('API analyze access error or no user:', userError?.message);
    return NextResponse.json({ error: 'Unauthorized - Please log in.' }, { status: 401 });
  }

   // Note: Using the user's authenticated client. Ensure RLS on 'vocational_profile'
   // allows the user to upsert their own row.

  try {
    // 2. Fetch the latest Dreamscapes response for the user
    const { data: latestResponse, error: fetchError } = await supabase
      .from('dreamscapes_responses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single<DreamscapesDbRecord>();

    if (fetchError || !latestResponse) {
      console.error(`Error fetching latest response for user ${user.id}:`, fetchError?.message);
      if (fetchError?.code === 'PGRST116') {
         return NextResponse.json({ error: 'No workshop responses found to analyze.' }, { status: 404 });
      }
      throw fetchError || new Error('Failed to fetch latest response.');
    }

    const { responses } = latestResponse;

    // 3. Get OpenAI API Key
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY server environment variable not set.');
      throw new Error('OpenAI API key is not configured on the server.');
    }
    const openai = new OpenAI({ apiKey: openAIApiKey });

    // 4. Prepare Prompt
    let analysisInputText = `User Dreams:\n`;
    responses.dreams.forEach((dream: string, i: number) => {
      analysisInputText += `- Dream ${i + 1}: ${dream || 'Not provided'}\n`;
      const subDreams = responses.subDreams[`dream_${i}`] || [];
      subDreams.forEach((sd: { vision: string; why: string }, j: number) => {
        analysisInputText += `  - Vision ${j + 1}: ${sd.vision || 'Not provided'}\n`;
        analysisInputText += `    - Why: ${sd.why || 'Not provided'}\n`;
      });
    });
    analysisInputText += `\nEssay - God for a day:\n${responses.essayGod || 'Not provided'}\n`;
    analysisInputText += `\nEssay - Million euros:\n${responses.essayMillion || 'Not provided'}\n`;

    const systemPrompt = `You are an expert vocational analyst. Analyze the following user responses from a self-discovery workshop. Identify and list recurring themes (e.g., creativity, helping others, adventure, leadership, technical skill), core values demonstrated, potential career interests suggested by the content, and key motivators. Provide the output ONLY as a valid JSON object with the following keys: "themes" (array of strings), "values" (array of strings), "interests" (array of strings), "motivators" (array of strings), and "summary" (a brief text summary, max 100 words). Ensure the output is strictly JSON.`;
    const userPrompt = `Analyze these workshop responses:\n\n${analysisInputText}`;

    // 5. Call OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'gpt-3.5-turbo',
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const analysisContent = chatCompletion.choices[0]?.message?.content;
    if (!analysisContent) throw new Error('No content received from OpenAI analysis.');

    // 6. Parse Analysis Result
    let analysisResult: DreamscapesAnalysis;
     try {
       analysisResult = JSON.parse(analysisContent);
       if (!analysisResult || !Array.isArray(analysisResult.themes) || !analysisResult.summary) {
          throw new Error('Invalid JSON structure received from OpenAI.');
       }
     } catch (parseError: unknown) {
       console.error('Error parsing OpenAI response:', parseError);
       console.error('Raw OpenAI response:', analysisContent);
       const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
       throw new Error(`Failed to parse analysis result from OpenAI: ${errorMessage}`);
     }

    // 7. Upsert into vocational_profile
    const { error: upsertError } = await supabase
      .from('vocational_profile')
      .upsert(
        {
          user_id: user.id,
          dreamscapes_analysis: analysisResult,
          last_updated: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      console.error(`Error upserting profile for user ${user.id}:`, upsertError);
      throw new Error(`Failed to update vocational profile: ${upsertError.message}`);
    }

    console.log(`Manual analysis complete, profile updated for user ${user.id}.`);
    return NextResponse.json({ success: true, message: 'Analysis complete and profile updated.', analysis: analysisResult }, { status: 200 });

  } catch (error) {
     console.error('Error in manual analyze API route:', error);
     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
     return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
