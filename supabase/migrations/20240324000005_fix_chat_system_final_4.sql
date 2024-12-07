-- Drop existing RLS policies
drop policy if exists "Users can manage conversations" on public.conversations;
drop policy if exists "Users can manage messages" on public.messages;

-- Create new RLS policies for conversations
create policy "Users can manage own conversations"
  on public.conversations
  for all
  using (user_id = auth.uid());

-- Create new RLS policies for messages
create policy "Users can manage conversation messages"
  on public.messages
  for all
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and c.user_id = auth.uid()
    )
  );

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on public.conversations to authenticated;
grant all on public.messages to authenticated;
grant usage on type public.message_sender_type to authenticated;