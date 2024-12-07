import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Loader2, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Notification } from "@/lib/notifications";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onArchive: (id: string, e: React.MouseEvent) => void;
  onAction: (e: React.MouseEvent, action: { onClick: () => void }) => void;
}

function getIcon(type?: string) {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'progress':
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    default:
      return null;
  }
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ${days === 1 ? 'Tag' : 'Tage'}`;
  if (hours > 0) return `${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`;
  return 'Jetzt';
}

function canArchive(notification: Notification) {
  if (!notification.type) return true;
  if (notification.type !== 'progress') return true;
  return ['completed', 'error', 'cancelled'].includes(notification.status || '');
}

export function NotificationItem({ 
  notification, 
  onRead, 
  onArchive,
  onAction 
}: NotificationItemProps) {
  const handleActionClick = (e: React.MouseEvent, action: { onClick: () => void }) => {
    e.preventDefault();
    onAction(e, action);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    onArchive(notification.id, e);
  };

  return (
    <button
      className={cn(
        "w-full text-left transition-colors",
        "hover:bg-accent rounded-lg px-4 py-3",
        !notification.read && "bg-accent/50"
      )}
      onClick={() => onRead(notification.id)}
    >
      <div className="inline-flex items-center justify-center grid grid-cols-[auto_1fr_auto] items-start gap-4">
        <div className="inline-flex items-center justify-center whitespace-nowrap h-9 w-9">
          {getIcon(notification.type)}
        </div>

        {/* Content Column */}
        <div className="min-w-0">
          <div className="font-medium">
            <div className="flex items-center gap-2">
              <span className="truncate">{notification.title}</span>
              <time className="text-xs text-muted-foreground whitespace-nowrap">{formatTimestamp(notification.createdAt)}</time>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </div>

          {notification.type === 'progress' && 
           typeof notification.progress === 'number' && (
            <Progress 
              value={notification.progress} 
              className="h-1.5 mt-2"
            />
          )}

          {notification.actions?.length > 0 && (
            <div className="flex gap-2 mt-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => handleActionClick(e, action)}
                  className="text-xs text-destructive hover:text-destructive/80"
                  type="button"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Metadata Column */}
        <div className="flex items-center">

          {canArchive(notification) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={handleArchive}
            >
              <Archive className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </button>
  );
}