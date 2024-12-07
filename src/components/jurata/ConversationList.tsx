import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/lib/services/chat';
import { useTranslation } from 'react-i18next';

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function ConversationList({ conversations, onSelect, onNew }: ConversationListProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex justify-end">
        <Button onClick={onNew}>
          <Plus className="mr-2 h-4 w-4" />
          {t('chat.newConversation')}
        </Button>
      </div>

      <div className="space-y-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "w-full flex items-start gap-3 rounded-lg border p-3 text-left",
              "transition-colors hover:bg-muted/50"
            )}
          >
            <MessageSquare className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {conversation.title || t('chat.untitledConversation')}
                </p>
                <span className="text-xs text-muted-foreground">
                  {format(
                    new Date(conversation.last_message_at), 
                    i18n.language === 'de' ? "d. MMM yyyy, HH:mm" : "MMM d, yyyy, h:mm a",
                    { locale: i18n.language === 'de' ? de : enUS }
                  )}
                </span>
              </div>
              {conversation.metadata?.summary && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {conversation.metadata.summary}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}