-- Create career_scenarios table
CREATE TABLE IF NOT EXISTS career_scenarios (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  onet_code TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  estimated_duration_minutes INTEGER NOT NULL,
  points_reward INTEGER NOT NULL,
  steps JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_scenario_progress table
CREATE TABLE IF NOT EXISTS user_scenario_progress (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES career_scenarios(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_steps TEXT[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, scenario_id)
);

-- Create RLS policies for career_scenarios
ALTER TABLE career_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON career_scenarios FOR SELECT USING (true);
CREATE POLICY "Admin insert/update/delete" ON career_scenarios FOR ALL USING (
  auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.jwt() ->> 'role' = 'service_role')
);

-- Create RLS policies for user_scenario_progress
ALTER TABLE user_scenario_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON user_scenario_progress FOR SELECT USING (
  auth.uid() = user_id
);
CREATE POLICY "Users can insert own progress" ON user_scenario_progress FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "Users can update own progress" ON user_scenario_progress FOR UPDATE USING (
  auth.uid() = user_id
); 