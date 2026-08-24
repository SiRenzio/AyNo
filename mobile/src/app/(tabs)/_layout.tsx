import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, DeviceEventEmitter, Text, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { getNotificationsModule, notificationsAvailable } from '@/lib/local-notifications';
import { NotificationItem } from '@/lib/types';

const options = (title: string, icon: keyof typeof Ionicons.glyphMap, badge = 0) => ({
    title,
    tabBarIcon: ({ color, size }: { color: string; size: number }) => <View style={{ width: 32, height: 28, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={icon} color={color} size={size} />{badge ? <View style={{ position: 'absolute', top: -3, right: -2, minWidth: 15, height: 15, paddingHorizontal: 3, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ef4444', borderWidth: 1.5, borderColor: '#0f1422' }}><Text style={{ color: '#fff', fontSize: 8, lineHeight: 10, fontWeight: '800', textAlign: 'center', includeFontPadding: false }}>{badge > 99 ? '99+' : badge}</Text></View> : null}</View>,
});

export default function TabsLayout() {
    const { token } = useAuth();
    const [notificationCount, setNotificationCount] = useState(0);
    const refreshNotificationCount = useCallback(async () => {
        if (!token) {
            setNotificationCount(0);
            return;
        }
        try {
            const result = await api<{ notifications: NotificationItem[] }>('/notifications', {}, token);
            setNotificationCount(result.notifications.filter((notification) => !notification.read_at).length);
        } catch {
            // Keep the current badge during temporary connection failures.
        }
    }, [token]);

    useEffect(() => {
        let active = true;
        let notificationSubscription: { remove: () => void } | undefined;
        void refreshNotificationCount();
        const appStateSubscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') void refreshNotificationCount();
        });
        const changedSubscription = DeviceEventEmitter.addListener('notificationsChanged', () => void refreshNotificationCount());
        if (notificationsAvailable) {
            void getNotificationsModule().then((Notifications) => {
                if (active) notificationSubscription = Notifications.addNotificationReceivedListener(() => void refreshNotificationCount());
            });
        }
        return () => {
            active = false;
            appStateSubscription.remove();
            changedSubscription.remove();
            notificationSubscription?.remove();
        };
    }, [refreshNotificationCount]);

    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: '#0f1422' },
                headerShadowVisible: false,
                headerTintColor: '#f8fafc',
                tabBarStyle: { backgroundColor: '#0f1422', borderTopColor: '#263149', height: 66, paddingBottom: 8 },
                tabBarActiveTintColor: '#60a5fa',
                tabBarInactiveTintColor: '#64748b',
            }}
        >
            <Tabs.Screen name="home" options={options('Home', 'home-outline')} />
            <Tabs.Screen name="index" options={options('Events', 'calendar-outline')} />
            <Tabs.Screen name="create" options={options('Add', 'add-circle')} />
            <Tabs.Screen name="notifications" options={options('Reminders', 'notifications-outline', notificationCount)} />
            <Tabs.Screen name="profile" options={options('Profile', 'person-outline')} />
        </Tabs>
    );
}
