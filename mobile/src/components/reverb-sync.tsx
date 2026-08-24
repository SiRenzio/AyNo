import Echo from 'laravel-echo';
import { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { API_URL } from '@/lib/api';

const appKey = process.env.EXPO_PUBLIC_REVERB_APP_KEY;
const host = process.env.EXPO_PUBLIC_REVERB_HOST;
const port = Number(process.env.EXPO_PUBLIC_REVERB_PORT ?? 8080);
const secure = process.env.EXPO_PUBLIC_REVERB_SCHEME === 'https';

export function ReverbSync() {
    const { token, user } = useAuth();
    useEffect(() => {
        if (!token || !user || !appKey || !host) return;
        let echo: Echo<'reverb'> | undefined;
        let cancelled = false;

        void import('pusher-js/react-native')
            .then(({ default: Pusher }) => {
                if (cancelled) return;
                echo = new Echo({
                    broadcaster: 'reverb',
                    Pusher,
                    key: appKey,
                    wsHost: host,
                    wsPort: port,
                    wssPort: port,
                    forceTLS: secure,
                    enabledTransports: secure ? ['wss'] : ['ws'],
                    authEndpoint: `${API_URL}/broadcasting/auth`,
                    auth: { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } },
                });
                echo.private(`App.Models.User.${user.id}`).listen('.mobile.notifications.updated', () => {
                    DeviceEventEmitter.emit('remoteNotificationsChanged');
                    DeviceEventEmitter.emit('notificationsChanged');
                });
            })
            .catch(() => {
                // A development build created before NetInfo was installed cannot
                // start Pusher. Keep the rest of the app usable until it is rebuilt.
            });

        return () => {
            cancelled = true;
            echo?.leave(`App.Models.User.${user.id}`);
            echo?.disconnect();
        };
    }, [token, user]);
    return null;
}
