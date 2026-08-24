import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, BackHandler, DeviceEventEmitter, FlatList, LayoutAnimation, Pressable, Text, View } from 'react-native';

import { Screen, colors, styles } from '@/components/native-ui';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format-date';
import { getNotificationsModule } from '@/lib/local-notifications';
import { NotificationItem } from '@/lib/types';

const filters = ['all', 'unread', 'read', 'pending', 'sent', 'failed', 'cancelled'];
const animateSelectionLayout = () => LayoutAnimation.configureNext({
    duration: 220,
    create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    update: { type: LayoutAnimation.Types.easeInEaseOut },
    delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
});

export default function Reminders() {
    const { token } = useAuth();
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [filter, setFilter] = useState('all');
    const [selectionMode, setSelectionMode] = useState(false);
    const selectionModeRef = useRef(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const load = useCallback(async () => {
        const result = await api<{ notifications: NotificationItem[] }>('/notifications', {}, token);
        setItems(result.notifications);
        DeviceEventEmitter.emit('notificationsChanged');
    }, [token]);
    useFocusEffect(useCallback(() => { void load(); }, [load]));
    useEffect(() => { selectionModeRef.current = selectionMode; }, [selectionMode]);
    useFocusEffect(useCallback(() => {
        const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (!selectionModeRef.current) return false;
            animateSelectionLayout();
            selectionModeRef.current = false;
            setSelectionMode(false);
            setSelected(new Set());
            return true;
        });
        return () => {
            backSubscription.remove();
            if (selectionModeRef.current) animateSelectionLayout();
            selectionModeRef.current = false;
            setSelectionMode(false);
            setSelected(new Set());
        };
    }, []));
    useEffect(() => {
        let active = true;
        let subscription: { remove: () => void } | undefined;
        void getNotificationsModule().then((Notifications) => {
            if (active) subscription = Notifications.addNotificationReceivedListener(() => void load());
        });
        return () => { active = false; subscription?.remove(); };
    }, [load]);
    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('remoteNotificationsChanged', () => void load());
        return () => subscription.remove();
    }, [load]);

    const visible = useMemo(() => items.filter((item) => filter === 'all' || (filter === 'unread' ? !item.read_at : filter === 'read' ? !!item.read_at : item.status === filter)), [items, filter]);
    const allVisibleSelected = visible.length > 0 && visible.every((item) => selected.has(item.id));

    function toggleSelection(id: number) {
        animateSelectionLayout();
        setSelectionMode(true);
        setSelected((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }
    function exitSelection() { animateSelectionLayout(); setSelectionMode(false); setSelected(new Set()); }
    function checkAll() {
        animateSelectionLayout();
        setSelectionMode(true);
        setSelected(allVisibleSelected ? new Set() : new Set(visible.map((item) => item.id)));
    }
    async function markRead(ids?: number[]) {
        await api('/notifications/read', { method: 'PATCH', body: JSON.stringify({ ids }) }, token);
        exitSelection();
        await load();
    }
    function confirmBatchDelete() {
        const ids = [...selected];
        if (!ids.length) return;
        Alert.alert('Delete selected notifications?', `${ids.length} notification${ids.length === 1 ? '' : 's'} will be permanently removed.`, [
            { text: 'Keep them', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => { await api('/notifications', { method: 'DELETE', body: JSON.stringify({ ids }) }, token); exitSelection(); await load(); } },
        ]);
    }
    async function update(id: number, status?: 'pending' | 'cancelled') {
        await api(`/notifications/${id}`, { method: status ? 'PATCH' : 'DELETE', body: status ? JSON.stringify({ status }) : undefined }, token);
        await load();
    }
    function confirmUpdate(id: number, status?: 'pending' | 'cancelled') {
        const deleting = !status;
        const cancelling = status === 'cancelled';
        Alert.alert(deleting ? 'Delete notification?' : cancelling ? 'Cancel reminder?' : 'Retry reminder?', deleting ? 'This notification will be permanently removed.' : cancelling ? 'This reminder will no longer notify you.' : 'This reminder will be scheduled again if its time is still in the future.', [
            { text: 'Not now', style: 'cancel' },
            { text: deleting ? 'Delete' : cancelling ? 'Cancel reminder' : 'Retry', style: deleting || cancelling ? 'destructive' : 'default', onPress: () => void update(id, status) },
        ]);
    }
    async function open(item: NotificationItem) {
        if (selectionMode) { toggleSelection(item.id); return; }
        if (!item.read_at) await markRead([item.id]);
        router.push(`/events/${item.event.id}`);
    }

    return <Screen><FlatList showsVerticalScrollIndicator={false} data={visible} keyExtractor={(item) => String(item.id)} onRefresh={load} refreshing={false} ListHeaderComponent={<View><Text style={styles.title}>Notifications</Text><Text style={styles.subtitle}>Delivered native reminders appear here automatically.</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}><Action label={allVisibleSelected ? 'Clear all' : 'Check all'} icon={allVisibleSelected ? 'checkbox-outline' : 'square-outline'} onPress={checkAll} />{selectionMode ? <><Action label={`Read (${selected.size})`} icon="mail-open-outline" disabled={!selected.size} onPress={() => void markRead([...selected])} /><Action label={`Delete (${selected.size})`} icon="trash-outline" danger disabled={!selected.size} onPress={confirmBatchDelete} /></> : <Action label="Mark all read" icon="mail-open-outline" disabled={!items.some((item) => !item.read_at)} onPress={() => void markRead()} />}</View><FlatList horizontal data={filters} keyExtractor={(value) => value} showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }} renderItem={({ item: value }) => <Pressable onPress={() => setFilter(value)} style={{ paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, borderRadius: 16, backgroundColor: filter === value ? '#1d4ed8' : colors.card }}><Text style={{ color: filter === value ? 'white' : colors.muted, textTransform: 'capitalize' }}>{value}</Text></Pressable>} /></View>} ListEmptyComponent={<Text style={{ color: colors.muted }}>No reminders in this category.</Text>} renderItem={({ item }) => {
        const unread = !item.read_at;
        const checked = selected.has(item.id);
        return <Pressable onPress={() => void open(item)} onLongPress={() => toggleSelection(item.id)} delayLongPress={350} style={[styles.card, { backgroundColor: unread ? '#10203b' : '#091122', borderColor: checked ? '#60a5fa' : unread ? '#315a8f' : '#1e293b' }]}><View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 11 }}>{selectionMode ? <SelectionBox checked={checked} /> : unread ? <View style={{ width: 8, height: 8, marginTop: 6, borderRadius: 4, backgroundColor: '#60a5fa' }} /> : null}<View style={{ flex: 1 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}><Text style={{ color: unread ? '#fff' : '#cbd5e1', fontWeight: unread ? '800' : '600', flex: 1 }}>{item.event.title}</Text><Text style={{ color: item.status === 'sent' ? '#34d399' : item.status === 'failed' ? '#fb7185' : '#60a5fa', textTransform: 'capitalize', fontSize: 12 }}>{item.status}</Text></View><Text style={{ color: colors.muted, marginTop: 7 }}>Reminder: {formatDateTime(item.remind_at)}</Text><Text style={{ color: colors.muted, marginTop: 3 }}>Event: {formatDateTime(item.event.starts_at)}</Text>{!selectionMode ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 14 }}>{unread ? <Pressable onPress={() => void markRead([item.id])}><Text style={{ color: '#93c5fd' }}>Mark as read</Text></Pressable> : null}{item.status === 'pending' ? <Pressable onPress={() => confirmUpdate(item.id, 'cancelled')}><Text style={{ color: '#f59e0b' }}>Cancel</Text></Pressable> : null}{['failed', 'cancelled'].includes(item.status) ? <Pressable onPress={() => confirmUpdate(item.id, 'pending')}><Text style={{ color: '#60a5fa' }}>Retry</Text></Pressable> : null}<Pressable onPress={() => confirmUpdate(item.id)}><Text style={{ color: '#fb7185' }}>Delete</Text></Pressable></View> : null}</View></View></Pressable>;
    }} /></Screen>;
}

function SelectionBox({ checked }: { checked: boolean }) {
    const progress = useState(() => new Animated.Value(0))[0];
    useEffect(() => {
        Animated.spring(progress, { toValue: checked ? 1 : 0, damping: 16, stiffness: 240, mass: 0.7, useNativeDriver: true }).start();
    }, [checked, progress]);
    return <View style={{ width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: checked ? '#60a5fa' : '#64748b', backgroundColor: checked ? '#2563eb' : 'transparent', alignItems: 'center', justifyContent: 'center' }}><Animated.View style={{ opacity: progress, transform: [{ scale: progress }] }}><Ionicons name="checkmark" size={15} color="#fff" /></Animated.View></View>;
}

function Action({ label, icon, onPress, danger, disabled }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; danger?: boolean; disabled?: boolean }) {
    return <Pressable disabled={disabled} onPress={onPress} style={{ opacity: disabled ? 0.4 : 1, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: danger ? '#7f1d1d' : '#334155', backgroundColor: danger ? '#450a0a66' : '#0f172a', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 }}><Ionicons name={icon} size={15} color={danger ? '#fb7185' : '#93c5fd'} /><Text style={{ color: danger ? '#fb7185' : '#cbd5e1', fontSize: 12, fontWeight: '700' }}>{label}</Text></Pressable>;
}
