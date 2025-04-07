import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CareerMatchesClientPage from './CareerMatchesClientPage' // Import the client component

// Define the structure of the data we expect after joining and formatting
export interface CareerMatch {
  id: string; // occupation code
  title: string;
  score: number; // match_percentage
  description: string | null;
  growth: string; // Make required string to match mapped data
  tag: string; // Make required string to match mapped data
}

// Define the expected type for the Supabase query result
type CareerMatchQueryResult = {
  match_score: number | null;
  occupations: { code: string; title: string; description: string | null } | null; // Expect object or null
};

export default async function CareerMatchesServerPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Career Matches page access error or no user:', userError?.message)
    redirect('/login?message=You must be logged in to view career matches.')
  }

  // Fetch career matches joined with occupations
  let careerMatchesData: CareerMatch[] = [];
  const { data: matches, error: matchesError } = await supabase
    .from('career_matches')
    .select(`
      match_score,
      occupations ( code, title, description )
    `)
    .eq('user_id', user.id)
    .order('match_score', { ascending: false })
    .returns<CareerMatchQueryResult[]>(); // Use the specific query result type

  if (matchesError) {
    console.error('Error fetching career matches:', matchesError.message);
    // Handle error appropriately, maybe show an error message
  } else if (matches) {
    // Transform the fetched data
    careerMatchesData = matches
      .map(match => { // Correct variable name 'match' here
        // Safely access joined 'occupations' data
        const occupationData = match.occupations; // Already typed as object or null

        // Ensure occupationData and its properties exist before creating the object
        if (occupationData && occupationData.code && occupationData.title) {
          return {
            id: occupationData.code,
            title: occupationData.title,
            score: Math.round((match.match_score ?? 0) * 100),
            description: occupationData.description ?? null,
            growth: "N/A", // Placeholder - Assign required string
            tag: "Matched",   // Placeholder - Assign required string
          };
        }
        return null; // Return null for invalid matches
      })
      .filter((match): match is CareerMatch => match !== null); // Filter out null values and assert type
  }

  return (
    // The client component will handle the background and layout
    <CareerMatchesClientPage careerMatches={careerMatchesData} />
  )
}
