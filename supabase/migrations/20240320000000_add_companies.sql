-- Create companies table
create table public.companies (
  id uuid default gen_random_uuid() primary key,
  name varchar(255) not null,
  uid_number varchar(20),
  street varchar(255),
  street_number varchar(20),
  zip varchar(20),
  city varchar(100),
  country varchar(100),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) not null
);

-- Enable RLS for companies
alter table public.companies enable row level security;

-- Create RLS policy for companies
create policy "Users can manage their own company"
  on public.companies
  for all
  using (auth.uid() = user_id);