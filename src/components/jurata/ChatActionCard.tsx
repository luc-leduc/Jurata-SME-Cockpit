import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ACTION_CONFIGS } from "@/lib/chat-actions";

interface ChatActionCardProps {
  tag: string;
  message?: string;
  className?: string;
}

export function ChatActionCard({ tag, message, className }: ChatActionCardProps) {
  const navigate = useNavigate();
  const config = ACTION_CONFIGS[tag];

  if (!config) return null;

  const handleClick = () => {
    if (config.cta.external) {
      // Handle dynamic external URLs (like AI Lawyer)
      const externalUrl = typeof config.cta.external === 'function' 
        ? config.cta.external(message || '')
        : config.cta.external;
      
      window.open(externalUrl, '_blank');
    } else {
      navigate(config.cta.action);
    }
  };

  return (
    <Card className={cn(
      "w-full bg-card/50 backdrop-blur-sm hover:bg-card/75 transition-colors",
      className
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{config.title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">
          {config.description}
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleClick}
        >
          {config.cta.label}
          {config.cta.external ? (
            <ExternalLink className="ml-2 h-4 w-4" />
          ) : (
            <ArrowRight className="ml-2 h-4 w-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Utility function to extract tags from message
export function extractTags(message: string): string[] {
  const tagRegex = /\[\[(.*?)\]\]/g;
  const matches = [...message.matchAll(tagRegex)];
  return matches.map(match => match[1]);
}

// Utility function to remove tags from message
export function removeTags(message: string): string {
  return message.replace(/\[\[.*?\]\]/g, '').trim();
}