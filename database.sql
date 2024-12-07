-- Enable RLS
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;

-- Create account_groups table
create table public.account_groups (
  id uuid default gen_random_uuid() primary key,
  number varchar(10) not null,
  name varchar(255) not null,
  parent_id uuid references public.account_groups(id),
  system_account varchar(50),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) not null
);

-- Add unique constraint for number per user
alter table public.account_groups
  add constraint account_groups_number_user_id_key 
  unique (number, user_id);

-- Enable RLS for account_groups
alter table public.account_groups enable row level security;

-- Add RLS policy for account_groups
create policy "Users can manage their own account groups"
  on public.account_groups
  for all
  using (auth.uid() = user_id);

-- Add group support to accounts table
alter table public.accounts
  add column group_id uuid references public.account_groups(id),
  add column is_system boolean default false;

-- Create indexes
create index idx_accounts_group_id on public.accounts(group_id);
create index idx_account_groups_parent_id on public.account_groups(parent_id);
create index idx_accounts_number on public.accounts(number);
create index idx_account_groups_number on public.account_groups(number);

-- Update accounts RLS policy
drop policy if exists "Users can manage their own accounts" on public.accounts;
create policy "Users can manage their own accounts"
  on public.accounts
  for all
  using (auth.uid() = user_id);

-- Create function to get account hierarchy
create or replace function get_account_hierarchy(p_user_id uuid)
returns table (
  id uuid,
  number varchar,
  name varchar,
  parent_id uuid,
  level int,
  path text[]
)
language sql
stable
as $$
  with recursive hierarchy as (
    -- Base case: top-level groups
    select 
      g.id,
      g.number,
      g.name,
      g.parent_id,
      0 as level,
      array[g.number] as path
    from account_groups g
    where g.parent_id is null
    and g.user_id = p_user_id

    union all

    -- Recursive case: child groups
    select 
      g.id,
      g.number,
      g.name,
      g.parent_id,
      h.level + 1,
      h.path || g.number
    from account_groups g
    inner join hierarchy h on h.id = g.parent_id
    where g.user_id = p_user_id
  )
  select * from hierarchy
  order by path;
$$;