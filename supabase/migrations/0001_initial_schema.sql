-- 0001_initial_schema.sql

-- Extensions (Enable if not already enabled)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Already enabled by default on Supabase

-- Disable Row Level Security temporarily for table creation
ALTER ROLE postgres SET pgrst.db_anon_role = 'anon';
ALTER ROLE postgres SET pgrst.db_schemas = 'public, storage, graphql';

-- Drop existing objects if they exist (for idempotency during development)
DROP TABLE IF EXISTS public.user_memories CASCADE;
DROP TABLE IF EXISTS public.vocational_results CASCADE;
DROP TABLE IF EXISTS public.vocational_responses CASCADE;
DROP TABLE IF EXISTS public.quiz_responses CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.careers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Profiles Table
-- Stores public user data. Links to auth.users via user_id.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);
COMMENT ON TABLE public.profiles IS 'Public profile information for each user.';

-- Careers Table
-- Stores predefined career data.
CREATE TABLE public.careers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    riasec_code CHAR(1), -- R, I, A, S, E, C
    required_skills TEXT[],
    salary_range_low INT,
    salary_range_high INT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.careers IS 'Information about various careers.';

-- Badges Table
-- Stores definitions for achievable badges.
CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    criteria JSONB, -- e.g., {"points_required": 100, "quiz_completed": "intro_quiz"}
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.badges IS 'Defines badges users can earn.';

-- Quiz Questions Table
-- Stores questions for various quizzes.
CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id TEXT NOT NULL, -- Identifier for the quiz (e.g., 'intro_quiz', 'riasec_quiz_part1')
    question_order INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice', -- e.g., 'multiple_choice', 'likert', 'open_ended'
    options JSONB, -- For multiple choice/likert: [{"value": "a", "text": "Option A"}, ...]
    correct_answer TEXT, -- For scored quizzes
    points_value INT DEFAULT 10, -- Points awarded for correct answer
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (quiz_id, question_order)
);
COMMENT ON TABLE public.quiz_questions IS 'Stores questions for different quizzes.';

-- User Progress Table
-- Tracks user points, level, and earned badges.
CREATE TABLE public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    points INT DEFAULT 0 NOT NULL,
    level INT DEFAULT 1 NOT NULL,
    earned_badge_ids UUID[] DEFAULT ARRAY[]::UUID[],
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.user_progress IS 'Tracks user points, level, and earned badges.';

-- Quiz Responses Table
-- Stores user answers to quiz questions.
CREATE TABLE public.quiz_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
    quiz_id TEXT NOT NULL, -- Denormalized for easier querying
    response JSONB NOT NULL, -- Could be simple value or complex object depending on question_type
    is_correct BOOLEAN, -- Null if not applicable
    points_awarded INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, question_id)
);
COMMENT ON TABLE public.quiz_responses IS 'Stores user answers to quiz questions.';
CREATE INDEX idx_quiz_responses_user_quiz ON public.quiz_responses(user_id, quiz_id);

-- Vocational Responses Table
-- Stores user responses to vocational assessment sections/questions.
CREATE TABLE public.vocational_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assessment_id TEXT NOT NULL DEFAULT 'main_vocational', -- Identifier for the assessment
    section_id TEXT NOT NULL, -- e.g., 'interests', 'skills', 'values', 'open_ended_goals'
    response_data JSONB NOT NULL, -- Flexible structure for various question types
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Add UNIQUE constraint for upsert
    CONSTRAINT vocational_responses_user_assessment_section_key UNIQUE (user_id, assessment_id, section_id)
);
COMMENT ON TABLE public.vocational_responses IS 'Stores user responses for vocational assessments.';
CREATE INDEX idx_vocational_responses_user_assessment ON public.vocational_responses(user_id, assessment_id);

-- Vocational Results Table
-- Stores calculated scores and AI analysis based on vocational responses.
CREATE TABLE public.vocational_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE, -- Typically one result set per user
    assessment_id TEXT NOT NULL DEFAULT 'main_vocational',
    riasec_scores JSONB, -- e.g., {"R": 5, "I": 8, "A": 3, "S": 6, "E": 7, "C": 4}
    top_career_matches UUID[] DEFAULT ARRAY[]::UUID[], -- References public.careers(id)
    strengths_analysis TEXT, -- AI-generated text
    areas_for_development TEXT, -- AI-generated text
    potential_contradictions TEXT, -- AI-generated text
    full_ai_analysis JSONB, -- Store the complete AI response if needed
    embeddings VECTOR(1536), -- Placeholder for future vector search (adjust dimension as needed)
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Add UNIQUE constraint for upsert
    CONSTRAINT vocational_results_user_assessment_key UNIQUE (user_id, assessment_id)
);
COMMENT ON TABLE public.vocational_results IS 'Stores calculated scores and AI analysis from vocational assessments.';
-- Add index for embeddings if using pgvector
-- CREATE INDEX idx_vocational_results_embeddings ON public.vocational_results USING ivfflat (embeddings vector_cosine_ops);

-- User Memories Table
-- Stores conversation history with the AI assistant.
CREATE TABLE public.user_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID DEFAULT uuid_generate_v4(), -- Group messages within a conversation session
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB, -- e.g., {"timestamp": "...", "tokens_used": 150, "related_docs": [...]}
    embeddings VECTOR(1536), -- Placeholder for future semantic search (adjust dimension as needed)
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.user_memories IS 'Stores conversation history with the AI assistant.';
CREATE INDEX idx_user_memories_user_created ON public.user_memories(user_id, created_at DESC);
-- Add index for embeddings if using pgvector
-- CREATE INDEX idx_user_memories_embeddings ON public.user_memories USING ivfflat (embeddings vector_cosine_ops);


-- Function to create a profile entry for a new user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Required for accessing auth.users
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  -- Initialize user progress
  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger to call handle_new_user on new user creation.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocational_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocational_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile." ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Careers Policies
CREATE POLICY "Careers are viewable by everyone." ON public.careers
  FOR SELECT USING (true);
-- Add INSERT/UPDATE/DELETE policies for admins if needed

-- Badges Policies
CREATE POLICY "Badges are viewable by everyone." ON public.badges
  FOR SELECT USING (true);
-- Add INSERT/UPDATE/DELETE policies for admins if needed

-- Quiz Questions Policies
CREATE POLICY "Quiz questions are viewable by authenticated users." ON public.quiz_questions
  FOR SELECT USING (auth.role() = 'authenticated');
-- Add INSERT/UPDATE/DELETE policies for admins if needed

-- User Progress Policies
CREATE POLICY "Users can view their own progress." ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress (e.g., via functions)." ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Prevent direct insertion/deletion by users; should be handled by triggers/functions.

-- Quiz Responses Policies
CREATE POLICY "Users can view their own quiz responses." ON public.quiz_responses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quiz responses." ON public.quiz_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quiz responses." ON public.quiz_responses
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Consider if deletion should be allowed.

-- Vocational Responses Policies
CREATE POLICY "Users can view their own vocational responses." ON public.vocational_responses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vocational responses." ON public.vocational_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vocational responses." ON public.vocational_responses
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Vocational Results Policies
CREATE POLICY "Users can view their own vocational results." ON public.vocational_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vocational results." ON public.vocational_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vocational results." ON public.vocational_results
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Note: Since user_id is UNIQUE, this effectively allows upsert by the owner.

-- User Memories Policies
CREATE POLICY "Users can view their own memories." ON public.user_memories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own memories." ON public.user_memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Consider if updates/deletions are needed.

-- Seed Data

-- Seed Badges
INSERT INTO public.badges (name, description, icon_url, criteria) VALUES
('First Steps', 'Completed the introductory quiz.', '/icons/badge_first_steps.png', '{"quiz_completed": "intro_quiz"}'),
('Explorer', 'Completed the Interests section of the vocational assessment.', '/icons/badge_explorer.png', '{"section_completed": "interests"}'),
('Skill Master', 'Achieved 1000 points.', '/icons/badge_skill_master.png', '{"points_required": 1000}');

-- Seed Careers (Example Data)
INSERT INTO public.careers (name, description, riasec_code, required_skills, salary_range_low, salary_range_high) VALUES
('Software Engineer', 'Designs, develops, and maintains software systems.', 'I', '{"Programming", "Problem Solving", "Algorithms", "Data Structures"}', 80000, 150000),
('Graphic Designer', 'Creates visual concepts using computer software or by hand.', 'A', '{"Creativity", "Typography", "Adobe Creative Suite", "Communication"}', 50000, 90000),
('Registered Nurse', 'Provides direct patient care in various healthcare settings.', 'S', '{"Empathy", "Critical Thinking", "Medical Knowledge", "Communication"}', 60000, 100000),
('Marketing Manager', 'Develops marketing strategies to promote products or services.', 'E', '{"Leadership", "Communication", "Market Analysis", "Creativity"}', 70000, 130000),
('Accountant', 'Prepares and examines financial records.', 'C', '{"Attention to Detail", "Mathematics", "Financial Regulations", "Software Proficiency"}', 55000, 95000),
('Research Scientist', 'Conducts scientific experiments and analyzes data.', 'R', '{"Analytical Skills", "Problem Solving", "Specific Domain Knowledge", "Data Analysis"}', 75000, 140000);

-- Seed Quiz Questions (Example Intro Quiz)
INSERT INTO public.quiz_questions (quiz_id, question_order, question_text, question_type, options, correct_answer, points_value) VALUES
('intro_quiz', 1, 'What is your primary goal for using this platform?', 'multiple_choice', '[{"value": "explore", "text": "Explore career options"}, {"value": "skills", "text": "Develop new skills"}, {"value": "guidance", "text": "Get personalized guidance"}, {"value": "unsure", "text": "I''m not sure yet"}]', null, 0),
('intro_quiz', 2, 'Which area are you most interested in exploring first?', 'multiple_choice', '[{"value": "interests", "text": "My Interests"}, {"value": "skills", "text": "My Skills"}, {"value": "values", "text": "My Work Values"}]', null, 0);

-- Re-enable default RLS behavior if needed (though typically managed by Supabase)
-- ALTER ROLE postgres RESET pgrst.db_anon_role;
-- ALTER ROLE postgres RESET pgrst.db_schemas;

-- Grant usage permissions to Supabase roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Grant specific permissions for RLS (adjust as needed)
GRANT SELECT ON TABLE public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;

GRANT SELECT ON TABLE public.careers TO anon, authenticated;
GRANT SELECT ON TABLE public.badges TO anon, authenticated;
GRANT SELECT ON TABLE public.quiz_questions TO authenticated;

GRANT SELECT, UPDATE ON TABLE public.user_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.quiz_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.vocational_responses TO authenticated;
GRANT SELECT ON TABLE public.vocational_results TO authenticated; -- Insert/Update via secure functions/service_role
GRANT SELECT, INSERT ON TABLE public.user_memories TO authenticated;

-- Allow authenticated users to execute the handle_new_user function via the trigger
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- Note: If using pgvector, ensure the extension is enabled in your Supabase project settings (Database -> Extensions).
-- You might need to run `CREATE EXTENSION IF NOT EXISTS vector;` separately via the SQL editor if not enabled.
-- Also, uncomment the VECTOR column definitions and index creation lines above.
