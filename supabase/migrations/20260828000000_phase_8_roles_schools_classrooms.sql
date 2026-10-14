create extension if not exists pgcrypto;

create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  role text not null default 'student' check (role in ('student', 'teacher', 'school_admin')),
  avatar text,
  created_at timestamptz not null default now()
);

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.school_members (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('student', 'teacher', 'school_admin')),
  unique (school_id, user_id)
);

create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  class_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.classroom_students (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (classroom_id, student_id)
);

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  path_id text not null check (path_id in ('fundamentos', 'rover', 'sensor', 'smart')),
  completed_lessons integer not null default 0 check (completed_lessons >= 0),
  xp integer not null default 0 check (xp >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, path_id)
);

create table if not exists public.user_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kit_id text not null check (kit_id in ('fundamentos-maker', 'rover-bot', 'sensor-lab', 'smart-bot')),
  unlocked_at timestamptz not null default now(),
  unique (user_id, kit_id)
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists school_members_school_id_idx on public.school_members(school_id);
create index if not exists school_members_user_id_idx on public.school_members(user_id);
create index if not exists classrooms_school_id_idx on public.classrooms(school_id);
create index if not exists classrooms_teacher_id_idx on public.classrooms(teacher_id);
create index if not exists classrooms_class_code_idx on public.classrooms(class_code);
create index if not exists classroom_students_classroom_id_idx on public.classroom_students(classroom_id);
create index if not exists classroom_students_student_id_idx on public.classroom_students(student_id);
create index if not exists learning_progress_user_id_idx on public.learning_progress(user_id);
create index if not exists user_kits_user_id_idx on public.user_kits(user_id);

alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.school_members enable row level security;
alter table public.classrooms enable row level security;
alter table public.classroom_students enable row level security;
alter table public.learning_progress enable row level security;
alter table public.user_kits enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.schools from anon, authenticated;
revoke all on public.school_members from anon, authenticated;
revoke all on public.classrooms from anon, authenticated;
revoke all on public.classroom_students from anon, authenticated;
revoke all on public.learning_progress from anon, authenticated;
revoke all on public.user_kits from anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select on public.schools to authenticated;
grant select, insert, update on public.school_members to authenticated;
grant select, insert, update on public.classrooms to authenticated;
grant select, insert on public.classroom_students to authenticated;
grant select, insert, update on public.learning_progress to authenticated;
grant select, insert, update on public.user_kits to authenticated;

create or replace function private.is_school_admin(target_school_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.school_members sm
    where sm.school_id = target_school_id
      and sm.user_id = (select auth.uid())
      and sm.role = 'school_admin'
  );
$$;

create or replace function private.is_school_member(target_school_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.school_members sm
    where sm.school_id = target_school_id
      and sm.user_id = (select auth.uid())
  );
$$;

create or replace function private.teaches_classroom(target_classroom_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.classrooms c
    where c.id = target_classroom_id
      and c.teacher_id = (select auth.uid())
  );
$$;

create or replace function private.teaches_student(target_student_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.classrooms c
    join public.classroom_students cs on cs.classroom_id = c.id
    where c.teacher_id = (select auth.uid())
      and cs.student_id = target_student_id
  );
$$;

create or replace function private.is_school_admin_of_user(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.school_members admin_member
    join public.school_members target_member
      on target_member.school_id = admin_member.school_id
    where admin_member.user_id = (select auth.uid())
      and admin_member.role = 'school_admin'
      and target_member.user_id = target_user_id
  );
$$;

revoke execute on all functions in schema private from public;
grant usage on schema private to authenticated;
grant execute on function private.is_school_admin(uuid) to authenticated;
grant execute on function private.is_school_member(uuid) to authenticated;
grant execute on function private.teaches_classroom(uuid) to authenticated;
grant execute on function private.teaches_student(uuid) to authenticated;
grant execute on function private.is_school_admin_of_user(uuid) to authenticated;

create policy "profiles_select_own_or_school_context"
on public.profiles for select
to authenticated
using (
  id = (select auth.uid())
  or private.teaches_student(id)
  or private.is_school_admin_of_user(id)
);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "schools_select_members"
on public.schools for select
to authenticated
using (private.is_school_member(id));

create policy "schools_update_admins"
on public.schools for update
to authenticated
using (private.is_school_admin(id))
with check (private.is_school_admin(id));

create policy "school_members_select_own_or_admin"
on public.school_members for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.is_school_admin(school_id)
);

create policy "school_members_insert_admins"
on public.school_members for insert
to authenticated
with check (private.is_school_admin(school_id));

create policy "school_members_update_admins"
on public.school_members for update
to authenticated
using (private.is_school_admin(school_id))
with check (private.is_school_admin(school_id));

create policy "classrooms_select_school_context"
on public.classrooms for select
to authenticated
using (
  teacher_id = (select auth.uid())
  or private.is_school_admin(school_id)
  or exists (
    select 1
    from public.classroom_students cs
    where cs.classroom_id = classrooms.id
      and cs.student_id = (select auth.uid())
  )
);

create policy "classrooms_insert_school_admins"
on public.classrooms for insert
to authenticated
with check (private.is_school_admin(school_id));

create policy "classrooms_update_school_admins"
on public.classrooms for update
to authenticated
using (private.is_school_admin(school_id))
with check (private.is_school_admin(school_id));

create policy "classroom_students_select_group_context"
on public.classroom_students for select
to authenticated
using (
  student_id = (select auth.uid())
  or private.teaches_classroom(classroom_id)
  or exists (
    select 1
    from public.classrooms c
    where c.id = classroom_students.classroom_id
      and private.is_school_admin(c.school_id)
  )
);

create policy "classroom_students_insert_self"
on public.classroom_students for insert
to authenticated
with check (student_id = (select auth.uid()));

create policy "learning_progress_select_allowed"
on public.learning_progress for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.teaches_student(user_id)
  or private.is_school_admin_of_user(user_id)
);

create policy "learning_progress_insert_own"
on public.learning_progress for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "learning_progress_update_own"
on public.learning_progress for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "user_kits_select_allowed"
on public.user_kits for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.teaches_student(user_id)
  or private.is_school_admin_of_user(user_id)
);

create policy "user_kits_insert_own"
on public.user_kits for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "user_kits_update_own"
on public.user_kits for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  requested_name text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', 'student');

  if requested_role not in ('student', 'teacher') then
    requested_role := 'student';
  end if;

  requested_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    split_part(new.email, '@', 1),
    'Maker'
  );

  insert into public.profiles (id, email, display_name, role, avatar)
  values (
    new.id,
    coalesce(new.email, ''),
    requested_name,
    requested_role,
    upper(left(requested_name, 1))
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = excluded.display_name;

  insert into public.user_kits (user_id, kit_id)
  values (new.id, 'fundamentos-maker')
  on conflict (user_id, kit_id) do nothing;

  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function public.join_classroom_by_code(join_code text)
returns setof public.classrooms
language plpgsql
security definer
set search_path = ''
as $$
declare
  found_classroom public.classrooms;
  current_user_id uuid;
begin
  current_user_id := (select auth.uid());

  if current_user_id is null then
    return;
  end if;

  select *
  into found_classroom
  from public.classrooms c
  where c.class_code = upper(trim(join_code))
  limit 1;

  if found_classroom.id is null then
    return;
  end if;

  insert into public.classroom_students (classroom_id, student_id)
  values (found_classroom.id, current_user_id)
  on conflict (classroom_id, student_id) do nothing;

  insert into public.school_members (school_id, user_id, role)
  values (found_classroom.school_id, current_user_id, 'student')
  on conflict (school_id, user_id) do nothing;

  return next found_classroom;
end;
$$;

revoke execute on function public.join_classroom_by_code(text) from public;
grant execute on function public.join_classroom_by_code(text) to authenticated;

insert into public.schools (name, code)
values ('Mini Maker Academy', 'MMA-001')
on conflict (code) do nothing;
