import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { updateConversationTitle } from '@/lib/services/chat';

export function useChatMetadata(conversationId: string | undefined) {
  const queryClient = useQueryClient();
  const hasUserInteracted = useRef(false);
  const isUpdating = useRef(false);

  // Track if user has interacted with the chat
  useEffect(() => {
    const handleMessage = () => {
      hasUserInteracted.current = true;
    };

    // Listen for message updates
    const unsubscribe = queryClient.getQueryCache().subscribe(({ type, query }) => {
      if (type === 'updated' && query.queryKey[0] === 'messages') {
        handleMessage();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  // Update metadata when leaving the conversation
  useEffect(() => {
    return () => {
      const updateMetadata = async () => {
        if (conversationId && hasUserInteracted.current && !isUpdating.current) {
          try {
            isUpdating.current = true;
            await updateConversationTitle(conversationId);
            await queryClient.invalidateQueries({ queryKey: ['conversations'] });
            await queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
          } catch (error) {
            console.error('Failed to update conversation metadata:', error);
          } finally {
            isUpdating.current = false;
          }
        }
      };

      updateMetadata();
    };
  }, [conversationId, queryClient]);

  // Also update when user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (conversationId && hasUserInteracted.current && !isUpdating.current) {
        isUpdating.current = true;
        updateConversationTitle(conversationId).finally(() => {
          isUpdating.current = false;
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [conversationId]);
}