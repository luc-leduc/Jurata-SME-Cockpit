-- Drop existing RLS policies
drop policy if exists "Users can view messages" on public.messages;
drop policy if exists "Users can create messages" on public.messages;
drop policy if exists "Users can view conversations" on public.conversations;
drop policy if exists "Users can create conversations" on public.conversations;

-- Create new RLS policies for conversations
create policy "Users can manage conversations"
  on public.conversations
  for all
  using (
    user_id = auth.uid() or
    company_id in (
      select c.id from public.companies c
      where c.user_id = auth.uid()
    )
  );

-- Create new RLS policies for messages
create policy "Users can manage messages"
  on public.messages
  for all
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

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on public.conversations to authenticated;
grant all on public.messages to authenticated;
grant usage on type public.message_sender_type to authenticated;