-- Create task_status enum
create type public.task_status as enum (
  'open',
  'in_progress', 
  'completed',
  'cancelled'
);

-- Create task_priority enum
create type public.task_priority as enum (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Create task_source enum
create type public.task_source as enum (
  'user',
  'system',
  'accountant'
);

-- Create task_area enum
create type public.task_area as enum (
  'accounting',
  'taxes',
  'payroll',
  'documents',
  'general'
);

-- Create tasks table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  title varchar(255) not null,
  description text,
  creator_id uuid references auth.users(id) not null,
  assignee_id uuid references auth.users(id),
  company_id uuid references public.companies(id) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  due_date timestamptz,
  completed_at timestamptz,
  completed_by uuid references auth.users(id),
  status task_status default 'open' not null,
  priority task_priority default 'medium' not null,
  source task_source not null,
  area task_area not null,
  parent_task_id uuid references public.tasks(id),
  is_recurring boolean default false,
  recurrence_pattern varchar(50),
  last_reminder_sent timestamptz,
  reminder_count integer default 0,
  external_reference varchar(255),
  metadata jsonb
);

-- Add indexes for common queries
create index idx_tasks_assignee on public.tasks(assignee_id);
create index idx_tasks_company on public.tasks(company_id);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_area on public.tasks(area);

-- Create task comments table for discussion
create table public.task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  parent_comment_id uuid references public.task_comments(id)
);

-- Create task attachments table
create table public.task_attachments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  file_name varchar(255) not null,
  file_size integer not null,
  file_type varchar(100) not null,
  storage_path text not null,
  created_at timestamptz default now() not null
);

-- Add updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger set_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();

create trigger set_comment_updated_at
  before update on public.task_comments
  for each row
  execute function public.handle_updated_at();

-- Enable RLS
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;

-- Create RLS policies
create policy "Users can view tasks for their company"
  on public.tasks
  for select
  using (
    company_id in (
      select c.id from public.companies c
      where c.user_id = auth.uid()
    )
  );

create policy "Users can create tasks for their company"
  on public.tasks
  for insert
  with check (
    company_id in (
      select c.id from public.companies c
      where c.user_id = auth.uid()
    )
  );

create policy "Users can update tasks they created or are assigned to"
  on public.tasks
  for update
  using (
    creator_id = auth.uid() or
    assignee_id = auth.uid()
  );

create policy "Users can view comments on their tasks"
  on public.task_comments
  for select
  using (
    task_id in (
      select t.id from public.tasks t
      where t.company_id in (
        select c.id from public.companies c
        where c.user_id = auth.uid()
      )
    )
  );

create policy "Users can create comments on their tasks"
  on public.task_comments
  for insert
  with check (
    task_id in (
      select t.id from public.tasks t
      where t.company_id in (
        select c.id from public.companies c
        where c.user_id = auth.uid()
      )
    )
  );

create policy "Users can update their own comments"
  on public.task_comments
  for update
  using (user_id = auth.uid());

create policy "Users can view attachments on their tasks"
  on public.task_attachments
  for select
  using (
    task_id in (
      select t.id from public.tasks t
      where t.company_id in (
        select c.id from public.companies c
        where c.user_id = auth.uid()
      )
    )
  );

create policy "Users can add attachments to their tasks"
  on public.task_attachments
  for insert
  with check (
    task_id in (
      select t.id from public.tasks t
      where t.company_id in (
        select c.id from public.companies c
        where c.user_id = auth.uid()
      )
    )
  );

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;