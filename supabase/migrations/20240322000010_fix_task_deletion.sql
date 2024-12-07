-- Drop existing RLS policies for tasks if they exist
drop policy if exists "Users can view tasks for their company" on public.tasks;
drop policy if exists "Users can create tasks for their company" on public.tasks;
drop policy if exists "Users can update tasks for their company" on public.tasks;
drop policy if exists "Users can delete tasks for their company" on public.tasks;
drop policy if exists "Users can view all tasks" on public.tasks;
drop policy if exists "Users can create tasks" on public.tasks;
drop policy if exists "Users can update tasks" on public.tasks;

-- Create new RLS policies with proper company-based access
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'tasks' 
    and policyname = 'Users can view tasks for their company'
  ) then
    create policy "Users can view tasks for their company"
      on public.tasks
      for select
      using (
        exists (
          select 1 from public.companies c
          where c.id = tasks.company_id
          and c.user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'tasks' 
    and policyname = 'Users can create tasks for their company'
  ) then
    create policy "Users can create tasks for their company"
      on public.tasks
      for insert
      with check (
        exists (
          select 1 from public.companies c
          where c.id = company_id
          and c.user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'tasks' 
    and policyname = 'Users can update tasks for their company'
  ) then
    create policy "Users can update tasks for their company"
      on public.tasks
      for update
      using (
        exists (
          select 1 from public.companies c
          where c.id = tasks.company_id
          and c.user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'tasks' 
    and policyname = 'Users can delete tasks for their company'
  ) then
    create policy "Users can delete tasks for their company"
      on public.tasks
      for delete
      using (
        exists (
          select 1 from public.companies c
          where c.id = tasks.company_id
          and c.user_id = auth.uid()
        )
      );
  end if;
end $$;