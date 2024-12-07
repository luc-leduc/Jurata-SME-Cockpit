-- Drop existing triggers and functions to avoid conflicts
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create or update user_profiles table
do $$ 
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'user_profiles') then
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
  end if;
end $$;

-- Enable RLS on user_profiles if not already enabled
alter table public.user_profiles enable row level security;

-- Create or replace RLS policies
drop policy if exists "Users can manage their own profile" on public.user_profiles;
create policy "Users can manage their own profile"
  on public.user_profiles
  for all
  using (auth.uid() = id);

-- Create or replace profile creation function
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

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Ensure permissions are granted
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all routines in schema public to anon, authenticated;