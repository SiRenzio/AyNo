import Constants from 'expo-constants';
import { LogBox, Platform } from 'react-native';

import { api } from './api';

type PushReminder = { id: number; remind_at: string; event: { id: number; title: string; location?: string } };

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

let handlerConfigured = false;
let notificationSyncQueue: Promise<void> = Promise.resolve();
export const notificationsAvailable = Constants.appOwnership !== 'expo' && Platform.OS !== 'web';

export async function getNotificationsModule() {
  const Notifications = await import('expo-notifications');
  if (!handlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
    });
    handlerConfigured = true;
  }
  return Notifications;
}

async function performLocalNotificationSync(token: string | null) {
  if (!token || !notificationsAvailable) return;
  const Notifications = await getNotificationsModule();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('event-reminders-v2', {
      name: 'Event reminders', importance: Notifications.AndroidImportance.HIGH,
      sound: 'default', vibrationPattern: [0, 250, 150, 250], lightColor: '#3b82f6',
    });
  }
  let permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') permission = await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return;
  const result = await api<{ reminders: PushReminder[] }>('/push-reminders', {}, token);
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const reminder of result.reminders) {
    const date = new Date(reminder.remind_at);
    if (date.getTime() <= Date.now()) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.event.title,
        body: reminder.event.location ? `It's time to prepare · ${reminder.event.location}` : "It's time to prepare for your event.",
        sound: 'default', data: { url: `/events/${reminder.event.id}`, reminderId: reminder.id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: 'event-reminders-v2' },
    });
  }
}

export function syncLocalNotifications(token: string | null) {
  notificationSyncQueue = notificationSyncQueue
    .catch(() => undefined)
    .then(() => performLocalNotificationSync(token));
  return notificationSyncQueue;
}
