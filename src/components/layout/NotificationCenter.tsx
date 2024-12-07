import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { notificationStore, type Notification } from "@/lib/notifications";
import { NotificationItem } from './NotificationItem';
import { useTranslation } from "react-i18next";

export function NotificationCenter() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Subscribe to notification store updates
  useEffect(() => {
    // Initial state
    setNotifications(notificationStore.getState().notifications);
    
    // Subscribe to updates
    const unsubscribe = notificationStore.subscribe((state) => {
      setNotifications([...state.notifications]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Sort notifications with newest first
  const sortedNotifications = [...notifications].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handlers
  const markAsRead = (id: string) => {
    const store = notificationStore.getState();
    store.updateNotification(id, { read: true });
  };

  const markAllAsRead = () => {
    const store = notificationStore.getState();
    notifications.forEach(notification => {
      if (!notification.read) {
        store.updateNotification(notification.id, { read: true });
      }
    });
  };

  const handleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const store = notificationStore.getState();
    store.removeNotification(id);
  };

  const handleActionClick = (e: React.MouseEvent, action: { onClick: () => void }) => {
    e.stopPropagation();
    action.onClick();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 border-0"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        align="end" 
        side="bottom"
        className="w-[480px] p-0"
      >
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h4 className="text-sm font-medium">{t('components.notifications.title')}</h4>
          {unreadCount > 0 && (
            <Button
              variant="link"
              className="h-auto px-2 py-1 text-xs"
              onClick={markAllAsRead}
            >
              {t('components.notifications.markAllAsRead')}
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[min(calc(100vh-20rem),32rem)]">
          {notifications.length === 0 ? (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {t('components.notifications.noNotifications')}
              </p>
            </div>
          ) : (
            <div className="grid gap-1 p-1">
              {sortedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                  onArchive={handleArchive}
                  onAction={handleActionClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}