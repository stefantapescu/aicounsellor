import { NextResponse } from 'next/server';
import { findMatchingCareers, getUserCareerMatches } from '@/lib/supabase/onet';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's career matches
    const matches = await getUserCareerMatches(user.id);
    
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching career matches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile data from request body
    const userProfile = await request.json();
    
    if (!userProfile.skills || !userProfile.interests || !userProfile.values || !userProfile.workContext) {
      return NextResponse.json(
        { error: 'Missing required profile data' },
        { status: 400 }
      );
    }

    // Find matching careers
    const matches = await findMatchingCareers(user.id, userProfile);
    
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error finding matching careers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 