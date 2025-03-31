-- Migration: create_vocational_profile_table
-- Description: Creates the table to store consolidated vocational profile insights.

-- Create the table
create table public.vocational_profile (
  user_id uuid references auth.users on delete cascade not null primary key,
  assessment_summary jsonb null,
  dreamscapes_analysis jsonb null,
  quiz_performance jsonb null,
  combined_profile_summary text null,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add comments
comment on table public.vocational_profile is 'Stores consolidated vocational insights from assessments, workshops, quizzes, etc.';
comment on column public.vocational_profile.user_id is 'Links to the user.';
comment on column public.vocational_profile.assessment_summary is 'Structured summary/results from the main vocational assessment.';
comment on column public.vocational_profile.dreamscapes_analysis is 'Structured JSON output from AI analysis of the Dreamscapes workshop.';
comment on column public.vocational_profile.quiz_performance is 'Aggregated data or insights from user quiz results.';
comment on column public.vocational_profile.combined_profile_summary is 'An overall AI-generated narrative summary of the user''s profile.';
comment on column public.vocational_profile.last_updated is 'Timestamp of the last update to the profile.';

-- Enable Row Level Security (RLS)
alter table public.vocational_profile enable row level security;

-- Create RLS policies
-- Policy: Allow users to select their own profile
create policy "Allow users to select their own vocational profile"
on public.vocational_profile
for select using (auth.uid() = user_id);

-- Policy: Allow service roles or specific functions to update profiles (handled by Edge Function later)
-- Note: Direct updates by users are generally discouraged for this table.
-- We will rely on background functions to populate/update it.

-- Grant select permission to authenticated users
grant select on table public.vocational_profile to authenticated;
-- Grant necessary permissions for the service_role (implicitly used by Edge Functions)
-- Supabase handles this internally for Edge Functions calling the DB.
