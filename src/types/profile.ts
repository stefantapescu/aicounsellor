// Define type for the Dreamscapes analysis data (matching Edge Function output)
export interface DreamscapesAnalysis {
  themes: string[];
  values: string[];
  interests: string[];
  motivators: string[];
  summary: string;
}

// Define type for the vocational profile data from Supabase
export interface VocationalProfile {
  user_id: string;
  assessment_summary: unknown | null; // Changed any to unknown
  dreamscapes_analysis: DreamscapesAnalysis | null;
  quiz_performance: unknown | null; // Changed any to unknown
  combined_profile_summary: string | null;
  last_updated: string;
}

// You can add other profile-related types here as needed
