-- Migration: add_vocational_profile_upsert_policy
-- Description: Allows authenticated users to insert or update their own row in the vocational_profile table.

-- Drop existing policy if it exists (optional, for idempotency)
drop policy if exists "Allow users to upsert their own vocational profile" on public.vocational_profile;

-- Create policy for INSERT and UPDATE (Upsert)
-- The 'using' clause applies to UPDATE/DELETE, the 'with check' applies to INSERT/UPDATE.
create policy "Allow users to upsert their own vocational profile"
on public.vocational_profile
for update using (auth.uid() = user_id) -- Allow user to UPDATE their own row
with check (auth.uid() = user_id); -- Allow user to INSERT/UPDATE only their own row

-- Grant update permission (select was granted previously)
grant update on table public.vocational_profile to authenticated;

-- Note: The previous 'select' policy ("Allow users to select their own vocational profile") is still needed and remains.
-- This new policy specifically handles the 'update' part of an upsert and the 'insert/update' check.
-- We also need an INSERT policy check, which is covered by the 'with check' clause above.
-- However, let's explicitly grant INSERT permission as well for clarity.
grant insert on table public.vocational_profile to authenticated;
