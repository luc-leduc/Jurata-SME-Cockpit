import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, MessageSquare, Sparkles, Search } from 'lucide-react';
import { useChat, useConversations } from '@/hooks/use-chat';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function JurataAI() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const { data: conversations = [], isLoading } = useConversations();
  const { createConversation } = useChat();

  // Extract all unique tags from conversations
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    conversations.forEach(conversation => {
      conversation.metadata?.topics?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [conversations]);

  const handleNewConversation = async () => {
    try {
      setIsCreating(true);
      const conversation = await createConversation();
      navigate(`/request/${conversation.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error(t('jurataAIPage.conversation.error'));
    } finally {
      setIsCreating(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  // Filter conversations based on search term and selected tags
  const filteredConversations = conversations.filter(conversation => {
    const searchTerm = search.toLowerCase();
    const date = format(new Date(conversation.created_at), "d. MMMM yyyy", { locale: de });
    const topics = conversation.metadata?.topics || [];
    
    // Check if conversation matches search term
    const matchesSearch = 
      conversation.title?.toLowerCase().includes(searchTerm) ||
      conversation.metadata?.summary?.toLowerCase().includes(searchTerm) ||
      date.toLowerCase().includes(searchTerm) ||
      topics.some(topic => topic.toLowerCase().includes(searchTerm));

    // Check if conversation has all selected tags
    const matchesTags = selectedTags.size === 0 || 
      topics.some(topic => selectedTags.has(topic));

    return matchesSearch && matchesTags;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-medium">{t('jurataAIPage.title')}</h3>
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('jurataAIPage.description')}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('jurataAIPage.search.placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleNewConversation} disabled={isCreating}>
            <Plus className="mr-2 h-4 w-4" />
            {t('jurataAIPage.newConversation')}
          </Button>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-normal transition-colors",
                  selectedTags.has(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('jurataAIPage.loading')}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {search || selectedTags.size > 0 
              ? t('jurataAIPage.noResults')
              : t('jurataAIPage.noConversations')
            }
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const formattedDate = format(
              new Date(conversation.created_at),
              i18n.language === 'de' ? "d. MMMM yyyy" : "MMMM d, yyyy",
              { locale: i18n.language === 'de' ? de : enUS }
            );
            
            return (
              <Link
                key={conversation.id}
                to={`/request/${conversation.id}`}
                className="block"
              >
                <Card className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <MessageSquare className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm">
                            {conversation.title || t('jurataAIPage.conversation.from', { date: formattedDate })}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(
                              new Date(conversation.last_message_at), 
                              i18n.language === 'de' ? "d. MMM yyyy, HH:mm" : "MMM d, yyyy, h:mm a",
                              { locale: i18n.language === 'de' ? de : enUS }
                            )}
                          </span>
                        </div>
                        {conversation.metadata?.summary && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {conversation.metadata.summary}
                          </p>
                        )}
                        {conversation.metadata?.topics && conversation.metadata.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {conversation.metadata.topics.map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="text-xs font-normal"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}