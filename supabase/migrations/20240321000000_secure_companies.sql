-- Add unique constraint to ensure one company per user
alter table public.companies
  add constraint companies_user_id_key unique (user_id);

-- Update RLS policy to be more explicit
drop policy if exists "Users can manage their own company" on public.companies;

create policy "Users can view their own company"
  on public.companies
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own company"
  on public.companies
  for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from public.companies
      where user_id = auth.uid()
    )
  );

create policy "Users can update their own company"
  on public.companies
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own company"
  on public.companies
  for delete
  using (auth.uid() = user_id);