import { router } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { getNotificationsModule, notificationsAvailable, syncLocalNotifications } from '@/lib/local-notifications';

export function NotificationSync() {
  const { token } = useAuth();
  useEffect(() => {
    if (!notificationsAvailable) return;
    let active = true;
    let responseSubscription: { remove: () => void } | undefined;
    void syncLocalNotifications(token);
    const appState = AppState.addEventListener('change', state => { if (state === 'active') void syncLocalNotifications(token); });
    void getNotificationsModule().then(Notifications => {
      if (!active) return;
      responseSubscription = Notifications.addNotificationResponseReceivedListener(event => {
        const url = event.notification.request.content.data?.url;
        if (typeof url === 'string') router.push(url as never);
      });
    });
    return () => { active = false; appState.remove(); responseSubscription?.remove(); };
  }, [token]);
  return null;
}
