import { Metadata } from 'next'; // Removed ResolvingMetadata
import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation'; // Added redirect
import CareerDetailClientComponent from './CareerDetailClientComponent';

// Define and export a more comprehensive type for the data passed to the client
// This should align with the data structure used in the new design
export interface CareerDetails { // Added export
  id: string; // onetCode
  title: string;
  description: string | null;
  tasks: { description: string }[]; // Assuming tasks is an array of objects
  skills: { name: string; level?: number; description?: string; importance?: number }[]; // Assuming skills structure
  workStyles: { name: string; importance?: number }[]; // Assuming workStyles structure
  matchScore: number; // Added match score
  // Add other fields from the design if needed (e.g., growth, knowledge, abilities, workContext, interests, workValues)
  growth?: string;
  knowledge?: { name: string; description?: string; importance?: number }[];
  abilities?: { name: string; description?: string; importance?: number }[];
  workContext?: { description: string }[];
  interests?: unknown[]; // Use unknown[] instead of any[]
  workValues?: unknown[]; // Use unknown[] instead of any[]
}


interface CareerDetailPageProps {
  params: {
    onetCode: string;
  };
}

export async function generateMetadata(
  props: CareerDetailPageProps
  // parent: ResolvingMetadata // Removed unused parameter
): Promise<Metadata> {
  // Get the params object
  const params = props.params; // No need to await props.params
  const onetCode = params.onetCode;
  
  const supabase = await createClient();
  
  // Fetch occupation details
  const { data: occupation } = await supabase
    .from('occupations')
    .select('title, description')
    .eq('code', onetCode)
    .single();

  if (!occupation) {
    return {
      title: 'Career Details',
      description: 'Explore career details and opportunities',
    };
  }

  return {
    title: `${occupation.title} - Career Details`,
    description: occupation.description || `Learn about a career as ${occupation.title}`,
  };
}

export default async function CareerDetailPage(props: CareerDetailPageProps) {
  // Get the params object and await it
  const params = await props.params;
  const onetCode = params.onetCode;
  
  console.log('Fetching details for ONET Code:', onetCode);
  const supabase = await createClient();

  // Fetch occupation details
  const { data: occupation, error: occupationError } = await supabase
    .from('occupations')
    .select(`
      code,
      title,
      description,
      tasks,
      skills,
      knowledge,
      abilities,
      work_styles,
      work_context,
      interests,
      work_values
    `)
    .eq('code', onetCode)
    .single();

  if (occupationError || !occupation) {
    console.error('Error fetching occupation:', occupationError);
    return notFound();
  }

  // Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Authentication check - redirect if not logged in
    redirect('/login?message=Authentication required to view career details');
  }

  // Fetch the match score for this specific career and user
  let matchScore = 0;
  const { data: matchData, error: matchError } = await supabase
    .from('career_matches')
    .select('match_score')
    .eq('user_id', user.id)
    .eq('occupation_code', onetCode)
    .maybeSingle();

  if (matchError) {
    console.error('Error fetching match score:', matchError.message);
    // Continue without match score, or handle differently
  } else if (matchData) {
    matchScore = Math.round((matchData.match_score ?? 0) * 100);
  }


  // Format the occupation data into the CareerDetails structure
  const careerData: CareerDetails = {
    id: occupation.code, // Use onetCode as id
    title: occupation.title,
    description: occupation.description ?? null,
    // Safely map JSONB arrays, providing defaults if null/undefined
    tasks: Array.isArray(occupation.tasks)
      ? occupation.tasks.map(task => ({ description: typeof task === 'string' ? task : (task?.description ?? '') }))
      : [],
    skills: Array.isArray(occupation.skills)
      ? occupation.skills.map(skill => ({
          name: typeof skill === 'string' ? skill : (skill?.name ?? 'Unknown Skill'),
          level: typeof skill === 'object' ? skill?.level : undefined, // Assuming level might be in the object
          description: typeof skill === 'object' ? skill?.description : undefined,
          importance: typeof skill === 'object' ? skill?.importance : undefined,
        }))
      : [],
     workStyles: Array.isArray(occupation.work_styles)
       ? occupation.work_styles.map(style => ({
           name: typeof style === 'string' ? style : (style?.name ?? 'Unknown Style'),
           importance: typeof style === 'object' ? style?.importance : undefined,
         }))
       : [],
     // Add other fields similarly, checking array type and providing defaults
     knowledge: Array.isArray(occupation.knowledge) ? occupation.knowledge.map(k => ({ name: k?.name ?? '', description: k?.description, importance: k?.importance })) : [],
     abilities: Array.isArray(occupation.abilities) ? occupation.abilities.map(a => ({ name: a?.name ?? '', description: a?.description, importance: a?.importance })) : [],
     workContext: Array.isArray(occupation.work_context) ? occupation.work_context.map(c => ({ description: c?.description ?? '' })) : [],
     interests: Array.isArray(occupation.interests) ? occupation.interests : [],
     workValues: Array.isArray(occupation.work_values) ? occupation.work_values : [],
     matchScore: matchScore,
     growth: "N/A", // Placeholder for growth
   };

  return (
    // The client component will handle the main layout now
    // Pass the data using the 'occupation' prop name
    <CareerDetailClientComponent occupation={careerData} />
  );
}

// Optional: Generate static paths if you have a known list of codes
// export async function generateStaticParams() {
//   // Fetch all distinct onet_codes from your careers table
//   // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
//   // const { data } = await supabase.from('careers').select('onet_code');
//   // return data?.map(({ onet_code }) => ({ onetCode: onet_code })) || [];
//   return []; // Return empty array if not using static generation for this
// }
