import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  previousUserMessage?: string;
}

interface ChatContainerProps {
  messages: Message[];
  className?: string;
}

export function ChatContainer({ messages, className }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "h-full overflow-y-auto py-4",
        "[&::-webkit-scrollbar]:w-2",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/10",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20",
        className
      )}
    >
      <div className="space-y-6">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            isUser={message.isUser}
            previousUserMessage={message.previousUserMessage}
          />
        ))}
      </div>
    </div>
  );
}