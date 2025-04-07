import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Get all occupations from the database
 * This endpoint returns the occupations imported from O*NET
 */
export async function GET(request: Request) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Query occupations from database
    const { data: occupations, error, count } = await supabase
      .from('occupations')
      .select('*', { count: 'exact' })
      .order('title')
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching occupations:', error);
      return NextResponse.json({ error: 'Failed to fetch occupations' }, { status: 500 });
    }
    
    return NextResponse.json({
      occupations,
      total: count,
      limit,
      offset
    });
    
  } catch (error) {
    console.error('Error in occupations API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 