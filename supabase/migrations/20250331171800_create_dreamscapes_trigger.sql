-- Migration: create_dreamscapes_trigger
-- Description: Creates a trigger to invoke the analyze-dreamscapes Edge Function on new dreamscapes_responses inserts.

-- Ensure the HTTP extension is enabled (if not already)
-- You might need to run this separately via SQL editor if it fails in migration
-- create extension if not exists http with schema extensions;
-- Ensure pg_net is enabled (if not already)
-- create extension if not exists pg_net with schema extensions;


-- 1. Create the trigger function
create or replace function public.handle_new_dreamscapes_response()
returns trigger
language plpgsql
security definer set search_path = public -- Important for security
as $$
declare
  function_url text := current_setting('supabase.functions.url', true) || '/analyze-dreamscapes';
  -- service_role_key text := current_setting('secrets.supabase_service_role_key'); -- Removed: Cannot access secrets here
  payload jsonb;
begin
  -- Construct the payload matching the Edge Function's expectation
  payload := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', row_to_json(new),
      'old_record', null
    );

  -- Perform an HTTP request using pg_net
  -- Removed Authorization header as it's likely handled internally by Supabase trigger->function calls
  perform net.http_post(
    url:=function_url,
    headers:='{"Content-Type": "application/json"}'::jsonb,
    body:=payload
  )
  -- Optional: Add timeout_milliseconds parameter if needed
  -- timeout_milliseconds:=5000
  ;

  return new; -- Return the new record for INSERT triggers
exception
  when others then
    -- Log the error but allow the original insert to succeed
    raise warning '[handle_new_dreamscapes_response] Failed to invoke Edge Function analyze-dreamscapes: %', sqlerrm;
    -- Consider logging more details like payload if needed for debugging, but be mindful of PII
    return new;
end;
$$;

-- 2. Create the trigger on the dreamscapes_responses table
-- Drop existing trigger first if it exists (useful for development/re-running migrations)
drop trigger if exists on_dreamscapes_response_inserted on public.dreamscapes_responses;

create trigger on_dreamscapes_response_inserted
  after insert on public.dreamscapes_responses
  for each row execute function public.handle_new_dreamscapes_response();

-- Add comments
comment on function public.handle_new_dreamscapes_response() is 'Trigger function to call the analyze-dreamscapes Edge Function via HTTP POST using pg_net.';
comment on trigger on_dreamscapes_response_inserted on public.dreamscapes_responses is 'Invokes the analyze-dreamscapes Edge Function whenever a new response is inserted.';
