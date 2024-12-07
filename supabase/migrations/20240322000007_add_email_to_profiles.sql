-- Add email column to user_profiles if it doesn't exist
alter table public.user_profiles 
  add column if not exists email text;

-- Create function to sync email from auth.users
create or replace function public.sync_user_email()
returns trigger as $$
begin
  update public.user_profiles
  set email = new.email
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to sync email on user creation/update
drop trigger if exists sync_user_email on auth.users;
create trigger sync_user_email
  after insert or update of email on auth.users
  for each row
  execute function public.sync_user_email();

-- Sync existing emails
update public.user_profiles p
set email = u.email
from auth.users u
where p.id = u.id
and p.email is null;