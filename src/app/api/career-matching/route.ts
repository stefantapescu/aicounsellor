import { NextResponse } from 'next/server';
import { findMatchingCareers, getUserCareerMatches } from '@/lib/supabase/onet';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/ssr';
import { Database } from '@/lib/database.types';

// Validate environment variables during build
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
] as const;

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Create Supabase client with proper initialization
const createSupabaseClient = () => {
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
    options: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
    }
  });
};

// Route handler for fetching and finding career matches
export async function GET() {
  try {
    const supabase = createSupabaseClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('API Route GET /api/career-matching: Unauthorized', userError?.message);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const matches = await getUserCareerMatches(user.id);
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error in GET /api/career-matching:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('API Route POST /api/career-matching: Unauthorized', userError?.message);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userProfile = await request.json();
    if (!userProfile || typeof userProfile !== 'object' || !userProfile.skills || !userProfile.interests || !userProfile.values || !userProfile.workContext) {
      console.error('API Route POST /api/career-matching: Missing profile data', { 
        userId: user.id, 
        profileKeys: userProfile ? Object.keys(userProfile) : null 
      });
      return NextResponse.json(
        { error: 'Missing required profile data' },
        { status: 400 }
      );
    }

    const matches = await findMatchingCareers(user.id, userProfile);
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error in POST /api/career-matching:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
