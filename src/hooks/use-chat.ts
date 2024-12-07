import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getConversations, 
  getMessages, 
  createConversation, 
  sendMessage,
  type Conversation,
  type Message 
} from '@/lib/services/chat';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: Boolean(conversationId)
  });
}

export function useChat() {
  const queryClient = useQueryClient();

  const createConversationMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      return data;
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  return {
    createConversation: createConversationMutation.mutateAsync,
    sendMessage: sendMessageMutation.mutateAsync
  };
}