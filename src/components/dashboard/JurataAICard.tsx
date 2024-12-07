import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { useChat } from '@/hooks/use-chat';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getSubmitShortcut } from '@/lib/utils/keyboard';

export function JurataAICard() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { createConversation } = useChat();
  const { isMac, shortcut } = getSubmitShortcut();

  // Focus input on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    textarea.addEventListener('input', adjustHeight);
    return () => textarea.removeEventListener('input', adjustHeight);
  }, []);

  const handleSubmit = async () => {
    if (!query.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Create new conversation
      const conversation = await createConversation();

      // Store query in session storage for the chat view to pick up
      sessionStorage.setItem('pending_message', query.trim());

      // Navigate to conversation immediately
      navigate(`/request/${conversation.id}`);
      
      // Reset form
      setQuery('');
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error(t('dashboard.jurataAI.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard shortcut
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="bg-white dark:bg-background h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold">{t('dashboard.jurataAI.title')}</CardTitle>
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.jurataAI.description')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white dark:bg-background rounded-lg border">
          <Textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('dashboard.jurataAI.placeholder')}
            className="min-h-[96px] resize-none overflow-hidden text-sm leading-relaxed border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex items-center justify-end gap-3">
          <span className="text-xs text-muted-foreground">
            {t('dashboard.jurataAI.shortcut', { key: shortcut })}
          </span>
          <Button 
            onClick={handleSubmit} 
            disabled={!query.trim() || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('dashboard.jurataAI.submit')
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}