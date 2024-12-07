-- Drop existing RLS policies
drop policy if exists "Users can manage their own profile" on public.user_profiles;

-- Create new RLS policies
create policy "Users can view all profiles"
  on public.user_profiles
  for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.user_profiles
  for update
  using (auth.uid() = id);

-- Ensure permissions are granted
grant usage on schema public to authenticated;
grant select on public.user_profiles to authenticated;