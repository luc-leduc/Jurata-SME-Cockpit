import { useState, useEffect } from 'react';
import { ChatInput } from './ChatInput';
import { ChatContainer } from './ChatContainer';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMessages, sendMessage } from '@/lib/services/chat';
import { getChatCompletion } from '@/lib/services/chat-completion';
import { nanoid } from 'nanoid';

interface ChatViewProps {
  conversationId: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  previousUserMessage?: string;
}

export function ChatView({ conversationId }: ChatViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const rawMessages = await getMessages(conversationId);
      return rawMessages.map(msg => ({
        id: msg.id,
        text: msg.content,
        isUser: msg.sender_type === 'user'
      }));
    },
    enabled: !!conversationId
  });

  // Check for pending message from dashboard
  useEffect(() => {
    const pendingMessage = sessionStorage.getItem('pending_message');
    if (pendingMessage) {
      sessionStorage.removeItem('pending_message');
      handleSubmit(pendingMessage);
    }
  }, []);

  const handleSubmit = async (content: string) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      
      // Send user message
      const userMessage = await sendMessage({
        conversationId,
        content,
        senderType: 'user'
      });

      // Create temporary AI message for streaming
      const tempMessageId = nanoid();
      let completeResponse = '';

      // Update messages in cache with both user message and temporary AI message
      queryClient.setQueryData(['messages', conversationId], (old: Message[] = []) => [
        ...old,
        {
          id: userMessage.id,
          text: userMessage.content,
          isUser: true
        },
        {
          id: tempMessageId,
          text: '',
          isUser: false,
          previousUserMessage: content
        }
      ]);

      // Get all messages for context
      const allMessages = await getMessages(conversationId);

      // Get AI response with streaming
      await getChatCompletion(allMessages, (chunk) => {
        completeResponse += chunk;
        // Update temporary message with current response
        queryClient.setQueryData(['messages', conversationId], (old: Message[] = []) => {
          const messages = [...old];
          const tempIndex = messages.findIndex(m => m.id === tempMessageId);
          if (tempIndex !== -1) {
            messages[tempIndex] = {
              ...messages[tempIndex],
              text: completeResponse
            };
          }
          return messages;
        });
      });

      // Send complete AI response to backend
      const aiMessage = await sendMessage({
        conversationId,
        content: completeResponse,
        senderType: 'ai'
      });

      // Replace temporary message with actual message
      queryClient.setQueryData(['messages', conversationId], (old: Message[] = []) => {
        const messages = old.filter(m => m.id !== tempMessageId);
        return [
          ...messages,
          {
            id: aiMessage.id,
            text: aiMessage.content,
            isUser: false,
            previousUserMessage: content
          }
        ];
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Fehler beim Senden der Nachricht');
      
      // Remove temporary message on error
      queryClient.setQueryData(['messages', conversationId], (old: Message[] = []) => 
        old.filter(m => m.id !== tempMessageId)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full pt-30 pb-20 relative">
      <div className="flex-1 min-h-0 -mb-20 pb-8">
        <ChatContainer messages={messages} />
      </div>

      <div className="absolute inset-x-0 -bottom-10 pt-0 bg-[linear-gradient(to_top,hsl(var(--background))_0%,hsl(var(--background))_75%,transparent_100%)] pt-8">
        <div className="max-w-4xl mx-auto">
          <ChatInput 
            onSubmit={handleSubmit}
            isLoading={isLoading}
            className="mb-4"
          />
        </div>
      </div>
    </div>
  );
}