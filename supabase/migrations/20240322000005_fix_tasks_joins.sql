-- Enable access to auth schema for joins
grant usage on schema auth to postgres, anon, authenticated;
grant select on auth.users to postgres, anon, authenticated;

-- Create views to expose necessary user data
create or replace view public.task_users as
  select id, email
  from auth.users;

-- Update task foreign keys to reference the view
alter table public.tasks drop constraint if exists tasks_creator_id_fkey;
alter table public.tasks drop constraint if exists tasks_assignee_id_fkey;
alter table public.tasks drop constraint if exists tasks_completed_by_fkey;

alter table public.tasks
  add constraint tasks_creator_id_fkey
    foreign key (creator_id)
    references auth.users(id),
  add constraint tasks_assignee_id_fkey
    foreign key (assignee_id)
    references auth.users(id),
  add constraint tasks_completed_by_fkey
    foreign key (completed_by)
    references auth.users(id);

-- Grant access to the view
grant select on public.task_users to anon, authenticated;