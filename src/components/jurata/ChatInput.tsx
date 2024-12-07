import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSubmitShortcut } from '@/lib/utils/keyboard';
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatInput({ onSubmit, isLoading, className }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isMac, shortcut } = getSubmitShortcut();
  const { t } = useTranslation();

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

  // Handle keyboard shortcut
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSubmit(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '48px'; // Reset to initial height
        textareaRef.current.focus();
      }
    }
  };

  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto mb-4",
      "animate-in fade-in slide-in-from-bottom-4 duration-300",
      className
    )}>
      <div className="relative flex items-center rounded-lg border bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chatDetail.input.placeholder')}
          className="min-h-[48px] max-h-[200px] resize-none overflow-hidden text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-4 py-3"
          rows={1}
        />
        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-muted-foreground pointer-events-none select-none whitespace-nowrap">
            {t('chatDetail.input.submitHint', { key: shortcut })}
          </span>
          <Button 
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            size="icon"
            className="h-9 w-9 shrink-0"
          >
            <span className="sr-only">{t('chatDetail.input.submit')}</span>
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}