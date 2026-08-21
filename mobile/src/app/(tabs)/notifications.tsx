import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Screen, colors, styles } from '@/components/native-ui';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format-date';
import { getNotificationsModule } from '@/lib/local-notifications';
import { NotificationItem } from '@/lib/types';

export default function Reminders() {
    const { token } = useAuth();
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [filter, setFilter] = useState('all');
    const load = useCallback(
        () => api<{ notifications: NotificationItem[] }>('/notifications', {}, token).then((result) => setItems(result.notifications)),
        [token],
    );
    useFocusEffect(
        useCallback(() => {
            load();
        }, [load]),
    );
    useEffect(() => {
        let active = true;
        let subscription: { remove: () => void } | undefined;
        void getNotificationsModule().then((Notifications) => {
            if (!active) return;
            subscription = Notifications.addNotificationReceivedListener(() => void load());
        });
        return () => {
            active = false;
            subscription?.remove();
        };
    }, [load]);
    const visible = items.filter((item) => filter === 'all' || item.status === filter);
    async function update(id: number, status?: 'pending' | 'cancelled') {
        await api(`/notifications/${id}`, { method: status ? 'PATCH' : 'DELETE', body: status ? JSON.stringify({ status }) : undefined }, token);
        await load();
    }

    return (
        <Screen>
            <FlatList
                data={visible}
                keyExtractor={(item) => String(item.id)}
                onRefresh={load}
                refreshing={false}
                ListHeaderComponent={
                    <View>
                        <Text style={styles.title}>Notifications</Text>
                        <Text style={styles.subtitle}>Delivered native reminders appear here automatically.</Text>
                        <FlatList
                            horizontal
                            data={['all', 'pending', 'sent', 'failed', 'cancelled']}
                            keyExtractor={(value) => value}
                            showsHorizontalScrollIndicator={false}
                            style={{ marginBottom: 18 }}
                            renderItem={({ item: value }) => (
                                <Pressable
                                    onPress={() => setFilter(value)}
                                    style={{
                                        paddingVertical: 8,
                                        paddingHorizontal: 12,
                                        marginRight: 8,
                                        borderRadius: 16,
                                        backgroundColor: filter === value ? '#1d4ed8' : colors.card,
                                    }}
                                >
                                    <Text style={{ color: filter === value ? 'white' : colors.muted, textTransform: 'capitalize' }}>{value}</Text>
                                </Pressable>
                            )}
                        />
                    </View>
                }
                ListEmptyComponent={<Text style={{ color: colors.muted }}>No reminders in this category.</Text>}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Pressable onPress={() => router.push(`/events/${item.event.id}`)}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{item.event.title}</Text>
                                <Text
                                    style={{
                                        color: item.status === 'sent' ? '#34d399' : item.status === 'failed' ? '#fb7185' : '#60a5fa',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {item.status}
                                </Text>
                            </View>
                            <Text style={{ color: colors.muted, marginTop: 7 }}>Reminder: {formatDateTime(item.remind_at)}</Text>
                            <Text style={{ color: colors.muted, marginTop: 3 }}>Event: {formatDateTime(item.event.starts_at)}</Text>
                        </Pressable>
                        <View style={{ flexDirection: 'row', gap: 16, marginTop: 14 }}>
                            {item.status === 'pending' ? (
                                <Pressable onPress={() => update(item.id, 'cancelled')}>
                                    <Text style={{ color: '#f59e0b' }}>Cancel</Text>
                                </Pressable>
                            ) : null}
                            {['failed', 'cancelled'].includes(item.status) ? (
                                <Pressable onPress={() => update(item.id, 'pending')}>
                                    <Text style={{ color: '#60a5fa' }}>Retry</Text>
                                </Pressable>
                            ) : null}
                            <Pressable onPress={() => update(item.id)}>
                                <Text style={{ color: '#fb7185' }}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            />
        </Screen>
    );
}
