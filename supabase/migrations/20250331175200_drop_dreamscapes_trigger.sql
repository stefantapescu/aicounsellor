-- Migration: drop_dreamscapes_trigger
-- Description: Removes the automatic trigger and function for Dreamscapes analysis.

-- Drop the trigger
drop trigger if exists on_dreamscapes_response_inserted on public.dreamscapes_responses;

-- Drop the trigger function
drop function if exists public.handle_new_dreamscapes_response();
