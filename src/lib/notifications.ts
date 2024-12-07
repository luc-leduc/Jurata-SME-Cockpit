import { createStore } from 'zustand/vanilla';
import { nanoid } from 'nanoid';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'progress';
  progress?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  createdAt: Date;
}

type NotificationStore = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
};

export const notificationStore = createStore<NotificationStore>((set) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = nanoid();
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id,
          createdAt: new Date()
        }
      ]
    }));
    return id;
  },

  updateNotification: (id, updates) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, ...updates }
          : notification
      )
    }));
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id
      )
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  }
}));

export const useNotificationStore = () => notificationStore.getState();

// Helper functions for external usage
export const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
  return notificationStore.getState().addNotification(notification);
};

export const updateNotification = (id: string, updates: Partial<Notification>) => {
  notificationStore.getState().updateNotification(id, updates);
};

export const removeNotification = (id: string) => {
  notificationStore.getState().removeNotification(id);
};

export const clearNotifications = () => {
  notificationStore.getState().clearNotifications();
};