alter table public.profiles
  add column if not exists phone text not null default '',
  add column if not exists student_id_card_path text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, phone, university, course, year)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'university', ''),
    coalesce(new.raw_user_meta_data ->> 'course', ''),
    coalesce(new.raw_user_meta_data ->> 'year', 'Mwaka 1')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check (
    (select auth.uid()) = id
    and (student_id_card_path is null or student_id_card_path like (select auth.uid())::text || '/%')
  );

grant update (phone, student_id_card_path) on public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-id-cards',
  'student-id-cards',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[];

drop policy if exists "Users can upload their own student ID card" on storage.objects;
create policy "Users can upload their own student ID card"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'student-id-cards'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users and admins can view student ID cards" on storage.objects;
create policy "Users and admins can view student ID cards"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'student-id-cards'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select public.is_admin())
    )
  );

drop policy if exists "Users and admins can delete student ID cards" on storage.objects;
create policy "Users and admins can delete student ID cards"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'student-id-cards'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select public.is_admin())
    )
  );