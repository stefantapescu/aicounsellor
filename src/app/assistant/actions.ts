'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface SaveMessagePayload {
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  sessionId?: string; // Optional: To group conversations
  metadata?: any;
}

// Action to save a single chat message
export async function saveChatMessage({
  userId,
  role,
  content,
  sessionId, // Consider generating/managing session IDs
  metadata,
}: SaveMessagePayload) {
  if (!userId || !role || !content) {
    console.error('Missing data for saving chat message.')
    return { error: 'Missing required fields to save message.' }
  }

  const supabase = await createClient() // Await the client creation

  try {
    const { data, error } = await supabase
      .from('user_memories')
      .insert({
        user_id: userId,
        role: role,
        content: content,
        session_id: sessionId, // Pass if available
        metadata: metadata,
      })
      .select()
      .single()

    if (error) throw error

    console.log(`Chat message saved for user ${userId}, role ${role}.`)
    // Optionally revalidate the assistant path if displaying history directly
    // revalidatePath('/assistant')

    return { success: true, savedMessage: data }

  } catch (error: any) {
    console.error(`Error saving chat message for user ${userId}:`, error.message)
    return { error: error.message }
  }
}


// Action to prepare context and prompt for the AI
export async function prepareAssistantPrompt(userId: string, currentMessages: any[]) {
   if (!userId) {
    console.error('Missing userId for assistant prompt preparation.')
    return { error: 'User ID is required.' }
  }

  const supabase = await createClient() // Await the client creation

  try {
    // --- Fetch Context ---
    // 1. User Profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('user_id', userId)
      .single();
    if (profileError) console.warn("Could not fetch profile:", profileError.message);

    // 2. Vocational Results (Latest)
    const { data: results, error: resultsError } = await supabase
      .from('vocational_results')
      .select('riasec_scores, strengths_analysis, areas_for_development, potential_contradictions')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
     if (resultsError && resultsError.code !== 'PGRST116') console.warn("Could not fetch results:", resultsError.message);


    // 3. Recent User Memories (excluding current input, limit context window)
    // Convert currentMessages (from client state) to a simpler format if needed
    const recentHistory = currentMessages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant') // Exclude system messages from history context
        .slice(-6) // Limit to last N interactions (adjust as needed)
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');


    // --- Format Prompt ---
    let context = "You are AI Youni, a helpful AI Educational Consultant. Your goal is to guide the user based on their profile, assessment results, and conversation history.\n\n";
    context += "## User Information:\n";
    context += `- Name: ${profile?.full_name || profile?.username || 'N/A'}\n\n`;

    if (results) {
        context += "## Latest Assessment Summary:\n";
        if (results.riasec_scores) context += `- RIASEC Scores: ${JSON.stringify(results.riasec_scores)}\n`;
        if (results.strengths_analysis) context += `- Strengths/Analysis: ${results.strengths_analysis}\n`;
        // Add other results fields if needed
        context += "\n";
    } else {
         context += "## Assessment Summary:\n- No assessment results found yet.\n\n";
    }

    context += "## Recent Conversation History:\n";
    context += recentHistory ? `${recentHistory}\n\n` : "- No recent history provided.\n\n";

    // Get the latest user message from the passed array
    const latestUserMessage = currentMessages.filter(msg => msg.role === 'user').pop()?.content || "[User message missing]";

    const finalPrompt = `${context}## Current User Question:\nuser: ${latestUserMessage}\n\n## Your Task:\nRespond helpfully and concisely as AI Youni, the AI Educational Consultant, drawing upon the provided user information, assessment summary, and conversation history. Address the user's current question directly. If external knowledge is needed beyond the context, use Perplexity search via available tools.`;

    console.log(`Assistant prompt prepared for user ${userId}.`);

    return { success: true, prompt: finalPrompt };

  } catch (error: any) {
    console.error(`Error preparing assistant prompt for user ${userId}:`, error.message)
    return { error: error.message }
  }
}
