-- =====================================================================
-- Student Task Web App – database schema (Supabase / Postgres)
-- Run this whole file once in: Supabase Dashboard > SQL Editor > New snippet
-- It matches the live project "student-task-system-lab".
-- =====================================================================


-- 1. TABLE ------------------------------------------------------------
-- One row per task. user_id links to the Supabase Auth user.
-- If a user account is deleted, their tasks are deleted too (cascade).
create table if not exists public.tasks (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  title      text        not null
             check (char_length(trim(title)) between 1 and 100),
  completed  boolean     not null default false,
  created_at timestamptz not null default now()
);

-- Speeds up "get my tasks" (used by RLS and by the dashboard query)
create index if not exists tasks_user_id_idx on public.tasks (user_id);


-- 2. ROW LEVEL SECURITY -------------------------------------------------
-- With RLS on, the browser can only see rows that a policy allows.
alter table public.tasks enable row level security;

-- The ONLY policy: a logged-in student can read their own tasks.
-- (select auth.uid()) is the user ID from the verified login token (JWT).
drop policy if exists "Students can read own tasks" on public.tasks;
create policy "Students can read own tasks"
  on public.tasks
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- There are deliberately NO insert / update / delete policies.
-- All changes go through the Edge Functions (create-task, toggle-task,
-- delete-task), which check the user and task ownership on the server.


-- 3. PERMISSIONS (GRANTS) ----------------------------------------------
-- Start from zero, then give each role only what it needs.
revoke all on table public.tasks from anon, authenticated;

-- Logged-in users (browser): read only. RLS limits this to their own rows.
grant select on table public.tasks to authenticated;

-- Edge Functions use the secret key (service_role) to write.
-- service_role bypasses RLS, so the functions must check ownership.
grant select, insert, update, delete on table public.tasks to service_role;

-- anon (not logged in) gets nothing.


-- 4. REALTIME -----------------------------------------------------------
-- Lets the dashboard update instantly. Realtime respects RLS for
-- INSERT/UPDATE events, so a student only receives their own changes.
-- (The frontend does not listen to DELETE events, because Supabase does
-- not apply RLS to DELETE events.)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;
end $$;


-- 5. FOLDERS (subjects) -------------------------------------------------
-- Each student can group tasks into their own folders, e.g. "SSE3308".
create table if not exists public.folders (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  name       text        not null
             check (char_length(trim(name)) between 1 and 40),
  created_at timestamptz not null default now(),
  -- needed so tasks can link to (folder id + owner) together, see below
  constraint folders_id_user_id_key unique (id, user_id)
);

create index if not exists folders_user_id_idx on public.folders (user_id);

-- A student cannot have two folders with the same name (case-insensitive)
create unique index if not exists folders_user_name_idx
  on public.folders (user_id, lower(trim(name)));

-- Same security as tasks: read own folders only, no direct writes.
alter table public.folders enable row level security;

drop policy if exists "Students can read own folders" on public.folders;
create policy "Students can read own folders"
  on public.folders
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.folders from anon, authenticated;
grant select on table public.folders to authenticated;
grant select, insert, update, delete on table public.folders to service_role;

-- Link tasks to a folder (optional: null = "No folder")
alter table public.tasks add column if not exists folder_id uuid;
create index if not exists tasks_folder_id_idx on public.tasks (folder_id);

-- OWNERSHIP RULE IN THE DATABASE:
-- (folder_id, user_id) must match a folder with the SAME owner.
-- So a task can never be put into another student's folder, even if
-- the Edge Function had a bug.
-- When a folder is deleted, its tasks are kept and folder_id becomes null.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tasks_folder_owner_fkey'
  ) then
    alter table public.tasks
      add constraint tasks_folder_owner_fkey
      foreign key (folder_id, user_id)
      references public.folders (id, user_id)
      on delete set null (folder_id);
  end if;
end $$;


-- 6. CHECK (optional) ---------------------------------------------------
-- Run these to confirm the setup:
-- select relname, relrowsecurity from pg_class where relname in ('tasks', 'folders');  -- both true
-- select tablename, policyname, cmd, roles from pg_policies where tablename in ('tasks', 'folders');  -- 2 rows, SELECT
-- select relname, relacl from pg_class where relname in ('tasks', 'folders');  -- authenticated=r..., service_role=arwd...
