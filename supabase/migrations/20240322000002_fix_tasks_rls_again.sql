-- Drop existing RLS policies
drop policy if exists "Users can view tasks for their company" on public.tasks;
drop policy if exists "Users can create tasks for their company" on public.tasks;
drop policy if exists "Users can update tasks they created or are assigned to" on public.tasks;

-- Create simpler RLS policies
create policy "Users can view all tasks"
  on public.tasks
  for select
  to authenticated
  using (true);

create policy "Users can create tasks"
  on public.tasks
  for insert
  to authenticated
  with check (true);

create policy "Users can update tasks"
  on public.tasks
  for update
  to authenticated
  using (true);