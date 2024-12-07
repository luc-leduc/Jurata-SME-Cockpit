import { useEffect, useState } from 'react';
import { useNotificationStore, type Notification } from '@/lib/notifications';

interface NotificationWithRead extends Notification {
  read?: boolean;
}

export function useNotifications() {
  const store = useNotificationStore();
  const [notifications, setNotifications] = useState<NotificationWithRead[]>([]);
  const [readState, setReadState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setNotifications(
      store.notifications.map(notification => ({
        ...notification,
        read: readState[notification.id] || false,
      }))
    );
  }, [store.notifications, readState]);

  const markAsRead = (id: string) => {
    setReadState(prev => ({ ...prev, [id]: true }));
  };

  const markAllAsRead = () => {
    const newReadState: Record<string, boolean> = {};
    notifications.forEach(notification => {
      newReadState[notification.id] = true;
    });
    setReadState(newReadState);
  };

  return {
    notifications: notifications.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    ),
    addNotification: store.addNotification,
    updateNotification: store.updateNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    markAsRead,
    markAllAsRead,
  };
}