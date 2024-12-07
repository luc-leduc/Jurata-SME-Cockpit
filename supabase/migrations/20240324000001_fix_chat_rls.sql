-- Drop existing RLS policies
drop policy if exists "Users can view messages in their conversations" on public.messages;
drop policy if exists "Users can create messages in their conversations" on public.messages;

-- Create new RLS policies with proper access
create policy "Users can view messages in their conversations"
  on public.messages
  for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (
        c.user_id = auth.uid() or
        c.company_id in (
          select comp.id from public.companies comp
          where comp.user_id = auth.uid()
        )
      )
    )
  );

create policy "Users can create messages"
  on public.messages
  for insert
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (
        c.user_id = auth.uid() or
        c.company_id in (
          select comp.id from public.companies comp
          where comp.user_id = auth.uid()
        )
      )
    )
  );

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on public.messages to authenticated;
grant all on public.conversations to authenticated;