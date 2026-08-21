import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button, Field, Screen, colors, styles } from '@/components/native-ui';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format-date';
import { syncLocalNotifications } from '@/lib/local-notifications';
import { ChecklistItem, EventDetail, Reminder } from '@/lib/types';

const quickReminders = [
    { label: '1 minute', value: 1 },
    { label: '5 minutes', value: 5 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '1 day', value: 1440 },
];
const statusColors: Record<string, string> = { upcoming: '#60a5fa', overdue: '#fbbf24', completed: '#34d399', cancelled: '#94a3b8' };

export default function EventDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { token } = useAuth();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [description, setDescription] = useState('');
    const [customMinutes, setCustomMinutes] = useState('');
    const load = useCallback(async () => {
        const result = await api<{ event: EventDetail }>(`/events/${id}?fresh=${Date.now()}`, {}, token);
        setEvent(result.event);
    }, [id, token]);
    useFocusEffect(
        useCallback(() => {
            load().catch((error) => Alert.alert('Could not load event', error.message));
        }, [load]),
    );
    const completed = useMemo(() => event?.checklist_items.filter((item) => item.is_completed).length ?? 0, [event]);
    const progress = event?.checklist_items.length ? Math.round((completed / event.checklist_items.length) * 100) : 0;

    async function toggle(itemId: number) {
        if (!event) return;
        const previous = event;
        const item = event.checklist_items.find((candidate) => candidate.id === itemId);
        if (!item) return;
        const value = !item.is_completed;
        setEvent({
            ...event,
            checklist_items: event.checklist_items.map((candidate) => (candidate.id === itemId ? { ...candidate, is_completed: value } : candidate)),
        });
        try {
            await api(`/checklist-items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ is_completed: value }) }, token);
        } catch (error) {
            setEvent(previous);
            Alert.alert('Unable to update checklist', error instanceof Error ? error.message : 'Try again.');
        }
    }

    async function addChecklistItem() {
        if (!event || !description.trim()) return;
        try {
            const result = await api<{ checklist_item: ChecklistItem }>(
                `/events/${id}/checklist-items`,
                { method: 'POST', body: JSON.stringify({ description: description.trim() }) },
                token,
            );
            setEvent({ ...event, checklist_items: [...event.checklist_items, result.checklist_item] });
            setDescription('');
        } catch (error) {
            Alert.alert('Unable to add item', error instanceof Error ? error.message : 'Try again.');
        }
    }

    async function addReminder(offset: number) {
        if (!event) return;
        try {
            const result = await api<{ reminder: Reminder }>(
                `/events/${id}/reminders`,
                { method: 'POST', body: JSON.stringify({ offset_minutes: offset }) },
                token,
            );
            setEvent({
                ...event,
                reminders: [...event.reminders.filter((item) => item.id !== result.reminder.id), result.reminder].sort((a, b) =>
                    a.remind_at.localeCompare(b.remind_at),
                ),
            });
        setCustomMinutes('');
        await syncLocalNotifications(token);
        } catch (error) {
            Alert.alert('Unable to add reminder', error instanceof Error ? error.message : 'Try again.');
        }
    }

    async function removeReminder(reminderId: number) {
        if (!event) return;
        const previous = event.reminders;
        setEvent({ ...event, reminders: previous.filter((item) => item.id !== reminderId) });
        try {
            await api(`/reminders/${reminderId}`, { method: 'DELETE' }, token);
            await syncLocalNotifications(token);
        } catch {
            setEvent({ ...event, reminders: previous });
        }
    }
    async function status(value: 'completed' | 'cancelled') {
        await api(`/events/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: value }) }, token);
        router.replace('/(tabs)/home');
    }
    function removeEvent() {
        Alert.alert('Delete event?', 'This permanently removes the event, checklist, and reminders.', [
            { text: 'Keep event', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await api(`/events/${id}`, { method: 'DELETE' }, token);
                    router.replace('/(tabs)');
                },
            },
        ]);
    }

    if (!event)
        return (
            <Screen>
                <ActivityIndicator color="#60a5fa" />
            </Screen>
        );
    const active = event.status === 'upcoming' || event.status === 'overdue';
    const accent = statusColors[event.status] ?? colors.muted;
    return (
        <Screen>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <View
                            style={{
                                alignSelf: 'flex-start',
                                borderWidth: 1,
                                borderColor: `${accent}55`,
                                backgroundColor: `${accent}18`,
                                borderRadius: 20,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                marginBottom: 12,
                            }}
                        >
                            <Text style={{ color: accent, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>{event.status}</Text>
                        </View>
                        <Text style={styles.title}>{event.title}</Text>
                        <Text style={styles.subtitle}>Everything you need for this event.</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {active ? (
                            <Pressable style={iconButton} onPress={() => router.push(`/events/${id}/edit`)}>
                                <Ionicons name="pencil" size={19} color="#60a5fa" />
                            </Pressable>
                        ) : null}
                        <Pressable style={iconButton} onPress={removeEvent}>
                            <Ionicons name="trash-outline" size={19} color="#fb7185" />
                        </Pressable>
                    </View>
                </View>
                <View style={panel}>
                    <Metadata label="Date & time" icon="time-outline" value={formatDateTime(event.starts_at)} />
                    <View style={divider} />
                    <Metadata label="Location" icon="location-outline" value={event.location ?? 'No location provided'} />
                    {event.notes ? (
                        <>
                            <View style={divider} />
                            <Text style={label}>NOTES</Text>
                            <Text style={{ color: '#bfdbfe', lineHeight: 22, marginTop: 8 }}>{event.notes}</Text>
                        </>
                    ) : null}
                </View>
                <View style={section}>
                    <View style={{ padding: 17 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={sectionTitle}>Checklist</Text>
                            <Text style={{ color: colors.muted, fontSize: 12 }}>
                                {completed} of {event.checklist_items.length} prepared
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 15 }}>
                            <View style={{ height: 6, flex: 1, borderRadius: 6, backgroundColor: '#1e293b', overflow: 'hidden' }}>
                                <View style={{ width: `${progress}%`, height: 6, backgroundColor: '#3b82f6' }} />
                            </View>
                            <Text style={{ color: colors.muted, fontSize: 12 }}>{progress}%</Text>
                        </View>
                    </View>
                    <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1e293b' }}>
                        {event.checklist_items.length ? (
                            event.checklist_items.map((item) => (
                                <Pressable
                                    key={item.id}
                                    onPress={() => toggle(item.id)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 12,
                                        minHeight: 50,
                                        paddingHorizontal: 17,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#1e293b',
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 18,
                                            height: 18,
                                            borderRadius: 4,
                                            borderWidth: 1,
                                            borderColor: item.is_completed ? '#3b82f6' : '#64748b',
                                            backgroundColor: item.is_completed ? '#2563eb' : 'transparent',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {item.is_completed ? <Ionicons name="checkmark" size={13} color="white" /> : null}
                                    </View>
                                    <Text
                                        style={{
                                            color: item.is_completed ? colors.muted : '#e2e8f0',
                                            textDecorationLine: item.is_completed ? 'line-through' : 'none',
                                            flex: 1,
                                        }}
                                    >
                                        {item.description}
                                    </Text>
                                </Pressable>
                            ))
                        ) : (
                            <Text style={{ color: colors.muted, padding: 17 }}>No checklist items yet.</Text>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, padding: 17 }}>
                        <Field
                            placeholder="Add checklist item…"
                            value={description}
                            onChangeText={setDescription}
                            style={{ flex: 1, marginBottom: 0 }}
                        />
                        <Pressable
                            onPress={addChecklistItem}
                            style={{ backgroundColor: '#2563eb', borderRadius: 11, width: 48, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Ionicons name="add" size={23} color="white" />
                        </Pressable>
                    </View>
                </View>
                <View style={section}>
                    <View style={{ padding: 17 }}>
                        <Text style={sectionTitle}>Reminders</Text>
                        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 5 }}>Email reminders for this event</Text>
                    </View>
                    <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1e293b' }}>
                        {event.reminders.length ? (
                            event.reminders.map((reminder) => (
                                <View
                                    key={reminder.id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: 15,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#1e293b',
                                    }}
                                >
                                    <Ionicons name="notifications-outline" size={18} color={colors.muted} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#bfdbfe', fontWeight: '600' }}>{reminder.offset_minutes} minutes before</Text>
                                        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>
                                            {formatDateTime(reminder.remind_at)}
                                        </Text>
                                    </View>
                                    <Text style={{ color: '#60a5fa', fontSize: 11, textTransform: 'capitalize' }}>{reminder.status}</Text>
                                    <Pressable onPress={() => removeReminder(reminder.id)}>
                                        <Ionicons name="trash-outline" size={18} color={colors.muted} />
                                    </Pressable>
                                </View>
                            ))
                        ) : (
                            <Text style={{ color: colors.muted, padding: 17 }}>No reminders scheduled.</Text>
                        )}
                    </View>
                    <View style={{ padding: 17 }}>
                        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 10 }}>Add reminder</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {quickReminders.map((option) => (
                                <Pressable
                                    key={option.value}
                                    onPress={() => addReminder(option.value)}
                                    style={{ borderWidth: 1, borderColor: '#334155', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 9 }}
                                >
                                    <Text style={{ color: '#bfdbfe', fontSize: 12 }}>{option.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                            <Field
                                keyboardType="number-pad"
                                placeholder="Custom minutes before"
                                value={customMinutes}
                                onChangeText={setCustomMinutes}
                                style={{ flex: 1, marginBottom: 0 }}
                            />
                            <Pressable
                                disabled={!Number(customMinutes)}
                                onPress={() => addReminder(Number(customMinutes))}
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#3b82f666',
                                    borderRadius: 10,
                                    paddingHorizontal: 14,
                                    justifyContent: 'center',
                                    opacity: Number(customMinutes) ? 1 : 0.4,
                                }}
                            >
                                <Text style={{ color: '#60a5fa', fontWeight: '700' }}>+ Add</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
                {active ? (
                    <View style={{ marginBottom: 30 }}>
                        <Button
                            title="Mark complete"
                            onPress={() => status('completed').catch((error) => Alert.alert('Unable to update', error.message))}
                        />
                        <Button
                            title="Cancel event"
                            danger
                            onPress={() => status('cancelled').catch((error) => Alert.alert('Unable to update', error.message))}
                        />
                    </View>
                ) : null}
            </ScrollView>
        </Screen>
    );
}

function Metadata({ label: title, icon, value }: { label: string; icon: keyof typeof Ionicons.glyphMap; value: string }) {
    return (
        <View>
            <Text style={label}>{title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Ionicons name={icon} size={17} color={colors.muted} />
                <Text style={{ color: colors.text, fontWeight: '600', flex: 1 }}>{value}</Text>
            </View>
        </View>
    );
}
const panel = { backgroundColor: '#091122', borderColor: '#1e293b', borderWidth: 1, borderRadius: 16, padding: 17, marginBottom: 16 } as const;
const section = {
    backgroundColor: '#091122',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
} as const;
const sectionTitle = { color: colors.text, fontSize: 16, fontWeight: '700' } as const;
const label = { color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.7, textTransform: 'uppercase' } as const;
const divider = { height: 1, backgroundColor: '#1e293b', marginVertical: 16 } as const;
const iconButton = {
    width: 40,
    height: 40,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
} as const;
