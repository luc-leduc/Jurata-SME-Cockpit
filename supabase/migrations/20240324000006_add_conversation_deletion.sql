-- Add is_deleted column to conversations table
alter table public.conversations
  add column if not exists is_deleted boolean default false;

-- Update RLS policies to exclude deleted conversations
drop policy if exists "Users can manage own conversations" on public.conversations;
create policy "Users can manage own conversations"
  on public.conversations
  for all
  using (
    user_id = auth.uid() and
    (is_deleted is null or is_deleted = false)
  );

-- Create index for faster filtering
create index if not exists idx_conversations_is_deleted
  on public.conversations(is_deleted)
  where is_deleted = true;