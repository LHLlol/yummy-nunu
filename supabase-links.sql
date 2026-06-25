create extension if not exists pgcrypto;

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text,
  user_agent text,
  is_valid boolean not null default true,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists links_created_at_idx on public.links (created_at desc);
create index if not exists links_url_idx on public.links (url);

alter table public.links enable row level security;

drop policy if exists "Allow public link submissions" on public.links;
create policy "Allow public link submissions"
on public.links
for insert
to anon
with check (
  url ~* '^https?://'
  and is_valid = true
);

drop policy if exists "Allow public link reads" on public.links;
create policy "Allow public link reads"
on public.links
for select
to anon
using (true);

drop policy if exists "Allow client-side vault updates" on public.links;
create policy "Allow client-side vault updates"
on public.links
for update
to anon
using (true)
with check (
  url ~* '^https?://'
  and is_valid = true
);

drop policy if exists "Allow client-side vault deletes" on public.links;
create policy "Allow client-side vault deletes"
on public.links
for delete
to anon
using (true);
