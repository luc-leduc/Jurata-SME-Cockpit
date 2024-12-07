-- First drop existing foreign key constraints
alter table public.tasks
  drop constraint if exists tasks_creator_id_fkey,
  drop constraint if exists tasks_assignee_id_fkey,
  drop constraint if exists tasks_completed_by_fkey;

-- Add the constraints back referencing user_profiles
alter table public.tasks
  add constraint tasks_creator_id_fkey
    foreign key (creator_id)
    references public.user_profiles(id),
  add constraint tasks_assignee_id_fkey
    foreign key (assignee_id)
    references public.user_profiles(id),
  add constraint tasks_completed_by_fkey
    foreign key (completed_by)
    references public.user_profiles(id);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant select on public.user_profiles to authenticated;