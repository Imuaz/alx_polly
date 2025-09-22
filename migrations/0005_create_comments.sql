-- Comments table for poll discussions
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid null references auth.users(id) on delete set null,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_comments_poll_id on public.comments(poll_id);
create index if not exists idx_comments_created_at on public.comments(created_at);

alter table public.comments enable row level security;

-- Allow public read
drop policy if exists "Allow public read comments" on public.comments;
create policy "Allow public read comments"
on public.comments for select
to anon, authenticated
using (true);

-- Allow authenticated users to insert
drop policy if exists "Allow auth insert comments" on public.comments;
create policy "Allow auth insert comments"
on public.comments for insert
to authenticated
with check (true);

comment on table public.comments is 'Discussion comments for polls';

