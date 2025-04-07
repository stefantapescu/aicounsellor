import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { scenarioId: string } }
) {
  try {
    const { stepId, completed } = await request.json();

    if (!stepId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's progress for this scenario
    const { data: userProgress, error: progressError } = await supabase
      .from('user_scenario_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('scenario_id', params.scenarioId)
      .single();

    if (progressError && progressError.code !== 'PGRST116') { // Not found error is ok
      console.error('Error fetching progress:', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      );
    }

    // If no progress record exists, create one
    if (!userProgress) {
      const { data: newProgress, error: createError } = await supabase
        .from('user_scenario_progress')
        .insert([{
          id: crypto.randomUUID(),
          user_id: user.id,
          scenario_id: params.scenarioId,
          current_step: 0,
          completed: false,
          completed_steps: [stepId],
          started_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating progress:', createError);
        return NextResponse.json(
          { error: 'Failed to create progress' },
          { status: 500 }
        );
      }

      return NextResponse.json(newProgress);
    }

    // Update the existing progress record
    const completedSteps = new Set(userProgress.completed_steps || []);
    
    if (completed) {
      completedSteps.add(stepId);
    } else {
      completedSteps.delete(stepId);
    }

    const { data: updatedProgress, error: updateError } = await supabase
      .from('user_scenario_progress')
      .update({
        completed_steps: Array.from(completedSteps),
        last_activity_at: new Date().toISOString()
      })
      .eq('id', userProgress.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating progress:', updateError);
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error('Error in progress API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { scenarioId: string } }
) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's progress for this scenario
    const { data: userProgress, error: progressError } = await supabase
      .from('user_scenario_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('scenario_id', params.scenarioId)
      .single();

    if (progressError && progressError.code !== 'PGRST116') { // Not found error is ok
      console.error('Error fetching progress:', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      );
    }

    if (!userProgress) {
      return NextResponse.json({ completed_steps: [] });
    }

    return NextResponse.json(userProgress);
  } catch (error) {
    console.error('Error in progress API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 