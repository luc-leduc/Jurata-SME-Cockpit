-- Drop existing RLS policies
drop policy if exists "Users can view own conversations" on public.conversations;
drop policy if exists "Users can create own conversations" on public.conversations;
drop policy if exists "Users can update own conversations" on public.conversations;
drop policy if exists "Users can view messages" on public.messages;
drop policy if exists "Users can create messages" on public.messages;

-- Create simplified RLS policies for conversations
create policy "Users can manage own conversations"
  on public.conversations
  for all
  using (user_id = auth.uid());

-- Create simplified RLS policies for messages
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

-- Ensure proper indexes
create index if not exists idx_conversations_user_id
  on public.conversations(user_id);

create index if not exists idx_conversations_company_id
  on public.conversations(company_id);

create index if not exists idx_messages_conversation_id
  on public.messages(conversation_id);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on public.conversations to authenticated;
grant all on public.messages to authenticated;