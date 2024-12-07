-- Drop existing RLS policies
drop policy if exists "Users can manage own conversations" on public.conversations;
drop policy if exists "Users can manage conversation messages" on public.messages;

-- Add is_deleted column if it doesn't exist
alter table public.conversations
  add column if not exists is_deleted boolean default false;

-- Create new RLS policies for conversations
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
  with check (user_id = auth.uid());

create policy "Users can update own conversations"
  on public.conversations
  for update
  using (user_id = auth.uid());

-- Create new RLS policies for messages
create policy "Users can view conversation messages"
  on public.messages
  for select
  using (
    exists (
      select 1 from conversations c
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
      select 1 from conversations c
      where c.id = conversation_id
      and c.user_id = auth.uid()
      and coalesce(c.is_deleted, false) = false
    )
  );

-- Create index for faster filtering
create index if not exists idx_conversations_is_deleted
  on public.conversations(is_deleted)
  where is_deleted = true;

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on public.conversations to authenticated;
grant all on public.messages to authenticated;