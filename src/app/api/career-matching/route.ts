import { NextResponse } from 'next/server';
import { findMatchingCareers, getUserCareerMatches } from '@/lib/supabase/onet';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/ssr'; // Corrected import name

// Route handler for fetching and finding career matches
export async function GET() {
  try {
    const cookieStore = cookies(); // Get cookie store
    // Create client using createRouteHandlerClient
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('API Route GET /api/career-matching: Unauthorized', userError?.message);
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
    const cookieStore = cookies(); // Get cookie store
     // Create client using createRouteHandlerClient
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
       console.error('API Route POST /api/career-matching: Unauthorized', userError?.message);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile data from request body
    const userProfile = await request.json();

    // Basic validation for required profile data
    if (!userProfile || typeof userProfile !== 'object' || !userProfile.skills || !userProfile.interests || !userProfile.values || !userProfile.workContext) {
       console.error('API Route POST /api/career-matching: Missing profile data', { userId: user.id, profileKeys: userProfile ? Object.keys(userProfile) : null });
      return NextResponse.json(
        { error: 'Missing required profile data' },
        { status: 400 }
      );
    }

    // Find matching careers
    const matches = await findMatchingCareers(user.id, userProfile);

    return NextResponse.json(matches);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error finding matching careers:', errorMessage, error);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
