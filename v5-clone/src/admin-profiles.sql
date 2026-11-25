-- Sheikh archive: sign-up profiles for the admin Users list.
-- Run this once in the Supabase dashboard (SQL Editor, project
-- sheikh-archive, id jhzejvhwvaoawgccthas). The anon key can never
-- list Auth users, so sign-ups write one row here (client-side, at
-- sign-up and at sign-in) and only the admin email can read it.
-- Until this is run, the admin Users tab honestly says the list is
-- not set up yet; it never shows made-up users.
create table if not exists public.profiles (
  id uuid primary key,
  email text not null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
-- A signed-in user may add only their own row, at sign-up or sign-in.
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
-- Nobody may change or remove a row.
create policy "profiles_no_update" on public.profiles
  for update using (false);
create policy "profiles_no_delete" on public.profiles
  for delete using (false);
-- Only the admin accounts may read the list.
create policy "profiles_select_admin" on public.profiles
  for select using (lower(auth.jwt() ->> 'email') in ('meroatschool@gmail.com', 'sheikhmoustafakamel@gmail.com'));
