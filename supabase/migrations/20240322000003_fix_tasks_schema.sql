-- First drop existing tables to ensure clean state
drop table if exists public.task_attachments;
drop table if exists public.task_comments;
drop table if exists public.tasks;

-- Recreate tasks table with proper references
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  title varchar(255) not null,
  description text,
  creator_id uuid not null,
  assignee_id uuid,
  company_id uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  due_date timestamptz,
  completed_at timestamptz,
  completed_by uuid,
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
  metadata jsonb,
  -- Add foreign key constraints
  constraint fk_creator foreign key (creator_id) references auth.users(id),
  constraint fk_assignee foreign key (assignee_id) references auth.users(id),
  constraint fk_completed_by foreign key (completed_by) references auth.users(id),
  constraint fk_company foreign key (company_id) references public.companies(id)
);

-- Recreate indexes
create index idx_tasks_assignee on public.tasks(assignee_id);
create index idx_tasks_company on public.tasks(company_id);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_area on public.tasks(area);

-- Recreate task comments table
create table public.task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid not null,
  user_id uuid not null,
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  parent_comment_id uuid references public.task_comments(id),
  constraint fk_task foreign key (task_id) references public.tasks(id) on delete cascade,
  constraint fk_user foreign key (user_id) references auth.users(id)
);

-- Recreate task attachments table
create table public.task_attachments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid not null,
  user_id uuid not null,
  file_name varchar(255) not null,
  file_size integer not null,
  file_type varchar(100) not null,
  storage_path text not null,
  created_at timestamptz default now() not null,
  constraint fk_task foreign key (task_id) references public.tasks(id) on delete cascade,
  constraint fk_user foreign key (user_id) references auth.users(id)
);

-- Enable RLS
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;

-- Create RLS policies
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