import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import ReactMarkdown from 'react-markdown';
import { ChatActionCard, extractTags, removeTags } from './ChatActionCard';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessageProps {
  message: string;
  isUser?: boolean;
  previousUserMessage?: string;
  className?: string;
}

export function ChatMessage({ 
  message, 
  isUser, 
  previousUserMessage,
  className 
}: ChatMessageProps) {
  const { data: profile } = useProfile();
  
  const initials = profile && isUser ? 
    [profile.first_name?.[0], profile.last_name?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() : 
    'U';

  // Extract tags and clean message
  const tags = extractTags(message);
  const cleanMessage = removeTags(message);

  return (
    <div className={cn(
      "flex gap-3 w-full max-w-4xl mx-auto",
      isUser && "flex-row-reverse",
      className
    )}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md",
        isUser ? "bg-primary" : "bg-muted"
      )}>
        {isUser ? (
          <span className="text-sm font-semibold text-primary-foreground">
            {initials}
          </span>
        ) : (
          <Sparkles className="h-4 w-4 text-foreground" />
        )}
      </div>

      <div className={cn(
        "flex flex-col gap-3",
        isUser ? "items-end" : "items-start",
        isUser ? "min-w-[200px] max-w-[60%]" : "max-w-[75%]"
      )}>
        <div className={cn(
          "rounded-lg px-4 py-3 w-full",
          isUser ? "bg-primary/10" : "bg-muted/50"
        )}>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{cleanMessage}</ReactMarkdown>
          </div>
        </div>

        {/* Action Cards */}
        {!isUser && tags.length > 0 && (
          <div className="flex flex-col gap-2 w-[400px]">
            <AnimatePresence initial={false}>
              {tags.map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                    delay: index * 0.15
                  }}
                >
                  <ChatActionCard 
                    tag={tag} 
                    message={previousUserMessage || ''}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}