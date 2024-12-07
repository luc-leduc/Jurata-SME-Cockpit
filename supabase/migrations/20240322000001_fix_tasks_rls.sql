-- Drop existing RLS policies
drop policy if exists "Users can view tasks for their company" on public.tasks;
drop policy if exists "Users can create tasks for their company" on public.tasks;
drop policy if exists "Users can update tasks they created or are assigned to" on public.tasks;

-- Create new RLS policies with fixed company access
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

create policy "Users can update tasks they created or are assigned to"
  on public.tasks
  for update
  using (
    creator_id = auth.uid() or
    assignee_id = auth.uid() or
    exists (
      select 1 from public.companies c
      where c.id = tasks.company_id
      and c.user_id = auth.uid()
    )
  );