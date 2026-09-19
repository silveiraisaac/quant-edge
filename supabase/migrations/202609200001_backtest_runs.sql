-- Apply in your Supabase project's SQL editor or via supabase db push.
create table if not exists public.backtest_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  settings jsonb not null check (jsonb_typeof(settings) = 'object' and octet_length(settings::text) <= 16000),
  summary jsonb not null check (jsonb_typeof(summary) = 'object' and octet_length(summary::text) <= 16000),
  provenance jsonb not null check (jsonb_typeof(provenance) = 'object' and octet_length(provenance::text) <= 8000),
  is_synthetic boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists backtest_runs_owner_created on public.backtest_runs(user_id, created_at desc);
alter table public.backtest_runs enable row level security;
alter table public.backtest_runs force row level security;
revoke all on public.backtest_runs from anon, authenticated;
grant select, insert, delete on public.backtest_runs to authenticated;
create policy read_own_runs on public.backtest_runs for select to authenticated using ((select auth.uid()) = user_id);
create policy insert_own_runs on public.backtest_runs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy delete_own_runs on public.backtest_runs for delete to authenticated using ((select auth.uid()) = user_id);
