-- Migration: create_dreamscapes_table
-- Description: Creates the table to store responses from the Dreamscapes workshop.

-- Create the table
create table public.dreamscapes_responses (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  responses jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone null -- Can be set when the user finishes the workshop
);

-- Add comments to the table and columns
comment on table public.dreamscapes_responses is 'Stores user responses from the Dreamscapes vocational discovery workshop.';
comment on column public.dreamscapes_responses.user_id is 'Links to the user who submitted the responses.';
comment on column public.dreamscapes_responses.responses is 'Stores all workshop answers (dreams, sub-dreams, whys, essays) as a JSON object.';
comment on column public.dreamscapes_responses.completed_at is 'Timestamp when the user completed the workshop.';

-- Enable Row Level Security (RLS)
alter table public.dreamscapes_responses enable row level security;

-- Create RLS policies
-- Policy: Allow users to insert their own responses
create policy "Allow users to insert their own dreamscapes responses"
on public.dreamscapes_responses
for insert with check (auth.uid() = user_id);

-- Policy: Allow users to select their own responses
create policy "Allow users to select their own dreamscapes responses"
on public.dreamscapes_responses
for select using (auth.uid() = user_id);

-- Policy: Allow users to update their own responses (optional, uncomment if needed)
-- create policy "Allow users to update their own dreamscapes responses"
-- on public.dreamscapes_responses
-- for update using (auth.uid() = user_id);

-- Grant usage permissions to authenticated users
grant select, insert, update, delete on table public.dreamscapes_responses to authenticated;
grant usage, select on sequence public.dreamscapes_responses_id_seq to authenticated;
