-- Create table to track poll share events
create table if not exists public.poll_shares (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  platform text null,
  created_at timestamptz not null default now()
);

-- Indexes for fast lookup and aggregations
create index if not exists idx_poll_shares_poll_id on public.poll_shares(poll_id);
create index if not exists idx_poll_shares_created_at on public.poll_shares(created_at);

-- Enable Row Level Security
alter table public.poll_shares enable row level security;

-- Allow anyone to insert share events (including anonymous users)
drop policy if exists "Allow public insert shares" on public.poll_shares;
create policy "Allow public insert shares"
on public.poll_shares for insert
to anon, authenticated
with check (true);

-- Allow anyone to select share stats
drop policy if exists "Allow public read shares" on public.poll_shares;
create policy "Allow public read shares"
on public.poll_shares for select
to anon, authenticated
using (true);

comment on table public.poll_shares is 'Tracks share events for polls for analytics (total and daily counts).';
comment on column public.poll_shares.platform is 'Optional platform hint: copy, twitter, facebook, linkedin, etc.';

