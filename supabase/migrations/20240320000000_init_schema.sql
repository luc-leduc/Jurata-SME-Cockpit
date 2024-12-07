-- Enable UUID extension
create extension if not exists "uuid-ossp";

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

-- Create user_profiles table
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  street text,
  zip text,
  city text,
  country text,
  role text not null default 'user',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.companies enable row level security;
alter table public.user_profiles enable row level security;

-- Create RLS policies
create policy "Users can manage their own company"
  on public.companies
  for all
  using (auth.uid() = user_id);

create policy "Users can manage their own profile"
  on public.user_profiles
  for all
  using (auth.uid() = id);

-- Create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id)
  values (new.id);
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all routines in schema public to anon, authenticated;