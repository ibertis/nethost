-- Keep-alive for the free tier: the VPS cron (/usr/local/bin/supabase-keepalive.sh)
-- calls POST /rest/v1/rpc/keepalive daily so the project never hits the 7-day pause.
-- Returns 1 and reads no data, so it is safe to expose to the anon key.
-- Idempotent: safe to re-run.
create or replace function public.keepalive()
returns integer
language sql
stable
security invoker
set search_path = ''
as $$ select 1 $$;

revoke all on function public.keepalive() from public;
grant execute on function public.keepalive() to anon, authenticated, service_role;
