-- Drop existing tables and constraints
drop table if exists public.task_attachments;
drop table if exists public.task_comments;
drop table if exists public.tasks;
drop view if exists public.task_users;

-- Create tasks table with user_profiles references
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  title varchar(255) not null,
  description text,
  creator_id uuid not null references public.user_profiles(id),
  assignee_id uuid references public.user_profiles(id),
  company_id uuid not null references public.companies(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  due_date timestamptz,
  completed_at timestamptz,
  completed_by uuid references public.user_profiles(id),
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

-- Create task comments table
create table public.task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id),
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  parent_comment_id uuid references public.task_comments(id)
);

-- Create task attachments table
create table public.task_attachments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id),
  file_name varchar(255) not null,
  file_size integer not null,
  file_type varchar(100) not null,
  storage_path text not null,
  created_at timestamptz default now() not null
);

-- Create indexes
create index idx_tasks_assignee on public.tasks(assignee_id);
create index idx_tasks_company on public.tasks(company_id);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_area on public.tasks(area);

-- Enable RLS
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;

-- Create RLS policies
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