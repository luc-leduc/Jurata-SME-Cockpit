import { supabase } from '../supabase';
import { generateTitleAndSummary, updateConversationMetadata } from './chat-ai';

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender_type: 'ai' | 'user' | 'team' | 'expert';
  sender_id?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  title?: string;
  user_id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  is_deleted?: boolean;
  metadata?: {
    summary?: string;
    topics?: string[];
  };
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .is('is_deleted', false)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No conversation found
      return null;
    }
    throw error;
  }

  return data;
}

export async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .is('is_deleted', false)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Failed to get conversations:', error);
    throw error;
  }

  return data || [];
}

export async function createConversation(): Promise<Conversation> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get user's company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (companyError || !company) throw new Error('No company found');

  // Create conversation
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      company_id: company.id,
      title: null,
      metadata: null,
      is_deleted: false
    })
    .select()
    .single();

  if (conversationError || !conversation) {
    console.error('Failed to create conversation:', conversationError);
    throw new Error('Failed to create conversation');
  }

  // Add welcome message
  const { error: messageError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      content: "Willkommen! Wie kann ich Ihnen heute helfen?",
      sender_type: 'ai'
    });

  if (messageError) {
    console.error('Failed to create welcome message:', messageError);
    throw messageError;
  }

  return conversation;
}

export async function deleteConversation(id: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ is_deleted: true })
    .eq('id', id);

  if (error) {
    console.error('Failed to delete conversation:', error);
    throw error;
  }
}

export async function sendMessage({
  conversationId,
  content,
  senderType = 'user'
}: {
  conversationId: string;
  content: string;
  senderType?: 'ai' | 'user' | 'team' | 'expert';
}): Promise<Message> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First check if conversation exists and is not deleted
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .is('is_deleted', false)
    .single();

  if (convError || !conversation) {
    throw new Error('Conversation not found or deleted');
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      content,
      sender_type: senderType,
      sender_id: senderType === 'user' ? user.id : null
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to send message:', error);
    throw error;
  }

  return data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to get messages:', error);
    throw error;
  }

  return data || [];
}

export async function updateConversationTitle(conversationId: string): Promise<void> {
  try {
    // Get all messages for the conversation
    const messages = await getMessages(conversationId);
    
    // Only update if there are user messages (more than just the welcome message)
    if (messages.length > 1) {
      // Generate title, summary and tags
      await updateConversationMetadata(conversationId, messages);
    }
  } catch (error) {
    console.error('Failed to update conversation title:', error);
  }
}