-- Drop existing RLS policies
drop policy if exists "Users can view own conversations" on public.conversations;
drop policy if exists "Users can create own conversations" on public.conversations;
drop policy if exists "Users can update own conversations" on public.conversations;
drop policy if exists "Users can view conversation messages" on public.messages;
drop policy if exists "Users can create messages" on public.messages;

-- Create new RLS policies for conversations with proper access
create policy "Users can view own conversations"
  on public.conversations
  for select
  using (
    user_id = auth.uid() and
    coalesce(is_deleted, false) = false
  );

create policy "Users can create own conversations"
  on public.conversations
  for insert
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from public.companies c
      where c.id = company_id
      and c.user_id = auth.uid()
    )
  );

create policy "Users can update own conversations"
  on public.conversations
  for update
  using (user_id = auth.uid());

-- Create new RLS policies for messages with proper access
create policy "Users can view messages"
  on public.messages
  for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and c.user_id = auth.uid()
      and coalesce(c.is_deleted, false) = false
    )
  );

create policy "Users can create messages"
  on public.messages
  for insert
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and c.user_id = auth.uid()
      and coalesce(c.is_deleted, false) = false
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