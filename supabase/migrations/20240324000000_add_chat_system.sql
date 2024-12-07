-- Create message_sender_type enum
create type public.message_sender_type as enum (
  'ai',
  'user',
  'team',
  'expert'
);

-- Create conversations table
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  title text,
  user_id uuid references auth.users(id) not null,
  company_id uuid references public.companies(id) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  last_message_at timestamptz default now() not null,
  metadata jsonb
);

-- Create messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  content text not null,
  sender_type message_sender_type not null,
  sender_id uuid references auth.users(id),
  created_at timestamptz default now() not null,
  metadata jsonb
);

-- Add indexes
create index idx_conversations_user on public.conversations(user_id);
create index idx_conversations_company on public.conversations(company_id);
create index idx_conversations_last_message on public.conversations(last_message_at desc);
create index idx_messages_conversation on public.messages(conversation_id);
create index idx_messages_created_at on public.messages(created_at);

-- Enable RLS
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Create RLS policies
create policy "Users can view their own conversations"
  on public.conversations
  for select
  using (
    user_id = auth.uid() or
    company_id in (
      select c.id from public.companies c
      where c.user_id = auth.uid()
    )
  );

create policy "Users can create conversations"
  on public.conversations
  for insert
  with check (
    user_id = auth.uid() and
    company_id in (
      select c.id from public.companies c
      where c.user_id = auth.uid()
    )
  );

create policy "Users can view messages in their conversations"
  on public.messages
  for select
  using (
    conversation_id in (
      select c.id from public.conversations c
      where c.user_id = auth.uid() or
      c.company_id in (
        select comp.id from public.companies comp
        where comp.user_id = auth.uid()
      )
    )
  );

create policy "Users can create messages in their conversations"
  on public.messages
  for insert
  with check (
    conversation_id in (
      select c.id from public.conversations c
      where c.user_id = auth.uid() or
      c.company_id in (
        select comp.id from public.companies comp
        where comp.user_id = auth.uid()
      )
    )
  );

-- Add updated_at trigger
create trigger set_conversations_updated_at
  before update on public.conversations
  for each row
  execute function public.handle_updated_at();

-- Add last_message_at trigger
create or replace function public.handle_message_timestamp()
returns trigger as $$
begin
  update public.conversations
  set last_message_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

create trigger update_conversation_timestamp
  after insert on public.messages
  for each row
  execute function public.handle_message_timestamp();