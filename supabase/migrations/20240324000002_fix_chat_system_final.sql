-- Drop existing RLS policies
drop policy if exists "Users can view messages in their conversations" on public.messages;
drop policy if exists "Users can create messages" on public.messages;
drop policy if exists "Users can view their own conversations" on public.conversations;
drop policy if exists "Users can create conversations" on public.conversations;

-- Create new RLS policies for conversations
create policy "Users can view conversations"
  on public.conversations
  for select
  to authenticated
  using (true);

create policy "Users can create conversations"
  on public.conversations
  for insert
  to authenticated
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from public.companies c
      where c.id = company_id
      and c.user_id = auth.uid()
    )
  );

-- Create new RLS policies for messages
create policy "Users can view messages"
  on public.messages
  for select
  to authenticated
  using (true);

create policy "Users can create messages"
  on public.messages
  for insert
  to authenticated
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
grant all on public.conversations to authenticated;
grant all on public.messages to authenticated;

-- Ensure enum type is accessible
grant usage on type public.message_sender_type to authenticated;