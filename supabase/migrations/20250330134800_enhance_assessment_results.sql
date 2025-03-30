-- Migration to add user_assessment_profiles table

-- Create the table to store calculated assessment profiles
CREATE TABLE public.user_assessment_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_session_id uuid, -- Optional: Link to a specific assessment session if needed
    riasec_scores jsonb,        -- Stores { "R": score, "I": score, "A": score, "S": score, "E": score, "C": score }
    personality_scores jsonb,   -- Stores { "O": score, "C": score, "E": score, "A": score, "N": score }
    aptitude_scores jsonb,      -- Stores { "verbal": score, "numerical": score, "abstract": score }
    work_values jsonb,          -- Stores ranked list like ["value_id_1", "value_id_2", "value_id_3"] or scores
    learning_style text,        -- Stores identified style like "Visual", "Auditory", "Read/Write", "Kinesthetic"
    raw_responses_snapshot jsonb, -- Optional: Store a snapshot of raw answers used for this profile
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes for frequent lookups
CREATE INDEX idx_user_assessment_profiles_user_id ON public.user_assessment_profiles(user_id);

-- Add a unique constraint on user_id to allow upsert on conflict
ALTER TABLE public.user_assessment_profiles
ADD CONSTRAINT user_assessment_profiles_user_id_key UNIQUE (user_id);
-- Note: Renamed constraint from 'unique_user_profile' for clarity

-- Enable Row Level Security (RLS) on the new table
ALTER TABLE public.user_assessment_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to select their own profile
CREATE POLICY "Allow individual user select access"
ON public.user_assessment_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow users to insert their own profile (consider if this should be restricted to backend service role)
-- If analysis is done server-side via API/action, insert might only need service_role key.
-- Let's allow insert for now, can be tightened later.
CREATE POLICY "Allow individual user insert access"
ON public.user_assessment_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own profile
CREATE POLICY "Allow individual user update access"
ON public.user_assessment_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Disallow delete for users (deletion should likely be handled carefully, maybe via backend)
CREATE POLICY "Disallow user delete access"
ON public.user_assessment_profiles
FOR DELETE
USING (false); -- Effectively blocks delete for regular users

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER on_profile_update
BEFORE UPDATE ON public.user_assessment_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.user_assessment_profiles IS 'Stores calculated assessment profiles for users based on their responses.';
COMMENT ON COLUMN public.user_assessment_profiles.riasec_scores IS 'JSON object containing scores for Realistic, Investigative, Artistic, Social, Enterprising, Conventional themes.';
COMMENT ON COLUMN public.user_assessment_profiles.personality_scores IS 'JSON object containing scores for Big Five traits: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism.';
COMMENT ON COLUMN public.user_assessment_profiles.aptitude_scores IS 'JSON object containing scores for different cognitive aptitude areas.';
COMMENT ON COLUMN public.user_assessment_profiles.work_values IS 'JSON object or array representing ranked work values.';
COMMENT ON COLUMN public.user_assessment_profiles.learning_style IS 'Identified primary learning style (e.g., VARK).';
