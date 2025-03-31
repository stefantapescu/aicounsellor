-- Migration: separate_vocational_profile_rls_policies
-- Description: Replaces the combined upsert policy with separate INSERT and UPDATE policies for vocational_profile.

-- Drop the combined policy created earlier
drop policy if exists "Allow users to upsert their own vocational profile" on public.vocational_profile;

-- Create explicit INSERT policy
-- Ensures a user can only insert a row with their own user_id
create policy "Allow users to insert their own vocational profile"
on public.vocational_profile
for insert
with check (auth.uid() = user_id);

-- Create explicit UPDATE policy
-- Ensures a user can only update rows where the user_id already matches their own
-- and the updated row still matches their user_id (redundant check here, but safe)
create policy "Allow users to update their own vocational profile"
on public.vocational_profile
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Permissions (INSERT and UPDATE) should already be granted from the previous migration,
-- but we can re-grant them just to be safe.
grant insert, update on table public.vocational_profile to authenticated;

-- The existing SELECT policy ("Allow users to select their own vocational profile") remains unchanged.
