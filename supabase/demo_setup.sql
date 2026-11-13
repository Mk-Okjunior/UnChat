-- Demo setup for Supabase auth + profile table
-- Paste this into Supabase SQL Editor and run it.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  university text not null default '',
  course text not null default '',
  year text not null default 'Mwaka 1',
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, university, course, year)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'university', ''),
    coalesce(new.raw_user_meta_data ->> 'course', ''),
    coalesce(new.raw_user_meta_data ->> 'year', 'Mwaka 1')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop policy if exists "Profiles are readable by owner and admins" on public.profiles;
create policy "Profiles are readable by owner and admins"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select on table public.profiles to authenticated;
grant update (full_name, university, course, year) on table public.profiles to authenticated;

-- Optional: backfill existing users who already exist in auth.users
insert into public.profiles (id, email, full_name, university, course, year)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name',''),
  coalesce(raw_user_meta_data->>'university',''),
  coalesce(raw_user_meta_data->>'course',''),
  coalesce(raw_user_meta_data->>'year','Mwaka 1')
from auth.users
on conflict (id) do nothing;
