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
  suggested_onet_codes: string[] | null; // Added suggested codes
}

// You can add other profile-related types here as needed

// Define the structure for career data returned by the matching API
export interface MatchedCareer {
  onet_code: string;
  name: string;
  description?: string | null;
  // Matching details
  score?: number; // How good the match is (e.g., 0.0 to 1.0)
  match_type?: 'direct_suggestion' | 'holland_match' | 'skill_match' | string; // How the match was derived
  // ONET/BLS Data
  median_wage_hourly?: number | null;
  median_wage_annual?: number | null;
  entry_level_education?: string | null;
  work_experience?: string | null;
  on_the_job_training?: string | null;
  employment_projection_national_growth_rate?: number | null; // e.g., 5 for 5%
  employment_projection_national_openings?: number | null; // Annual openings
  // Add other relevant fields as needed from your 'careers' table
  // e.g., tasks?: string[]; skills?: string[]; knowledge?: string[];
}
