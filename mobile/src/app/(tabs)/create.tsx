import { Button, Field, Screen, colors, styles } from '@/components/native-ui';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { syncLocalNotifications } from '@/lib/local-notifications';
import { EventTemplate } from '@/lib/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
const offsets = [
    { label: '1 min', value: 1 },
    { label: '5 min', value: 5 },
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '1 day', value: 1440 },
];
export default function CreateEvent() {
    const { token } = useAuth();
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date(Date.now() + 3600000));
    const [mode, setMode] = useState<'date' | 'time' | null>(null);
    const [items, setItems] = useState<string[]>([]);
    const [item, setItem] = useState('');
    const [selected, setSelected] = useState<number[]>([5]);
    const [templates, setTemplates] = useState<EventTemplate[]>([]);
    const [busy, setBusy] = useState(false);
    useFocusEffect(
        useCallback(() => {
            api<{ templates: EventTemplate[] }>('/templates', {}, token).then((r) => setTemplates(r.templates));
        }, [token]),
    );
    async function submit() {
        setBusy(true);
        try {
            await api(
                '/events',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        title,
                        location: location || null,
                        notes: notes || null,
                        starts_at: date.toISOString(),
                        checklist_items: items,
                        reminder_offsets: selected,
                    }),
                },
                token,
            );
            setTitle('');
            setLocation('');
            setNotes('');
            setItems([]);
            await syncLocalNotifications(token);
            router.replace('/(tabs)/home');
        } catch (e) {
            Alert.alert('Could not create event', e instanceof Error ? e.message : 'Try again.');
        } finally {
            setBusy(false);
        }
    }
    return (
        <Screen>
            <ScrollView keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>New event</Text>
                <Text style={styles.subtitle}>Add the details, checklist, and reminders.</Text>
                <Field placeholder="Event title" value={title} onChangeText={setTitle} />
                <Field placeholder="Location (optional)" value={location} onChangeText={setLocation} />
                <Field
                    placeholder="Notes (optional)"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    style={{ minHeight: 90, textAlignVertical: 'top' }}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable style={[styles.card, { flex: 1 }]} onPress={() => setMode('date')}>
                        <Text style={{ color: colors.muted }}>Date</Text>
                        <Text style={{ color: colors.text, marginTop: 5 }}>{date.toLocaleDateString()}</Text>
                    </Pressable>
                    <Pressable style={[styles.card, { flex: 1 }]} onPress={() => setMode('time')}>
                        <Text style={{ color: colors.muted }}>Time</Text>
                        <Text style={{ color: colors.text, marginTop: 5 }}>
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </Pressable>
                </View>
                {mode ? (
                    <DateTimePicker
                        value={date}
                        mode={mode}
                        minimumDate={new Date()}
                        onChange={(_, value) => {
                            setMode(Platform.OS === 'ios' ? mode : null);
                            if (value) setDate(value);
                        }}
                    />
                ) : null}
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18, marginVertical: 12 }}>Templates</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {templates.map((t) => (
                        <Pressable
                            key={t.id}
                            style={[styles.card, { width: 180, marginRight: 10 }]}
                            onPress={() => {
                                setTitle(t.name);
                                setItems(t.items);
                            }}
                        >
                            <Text style={{ color: colors.text, fontWeight: '700' }}>{t.name}</Text>
                            <Text style={{ color: colors.muted, marginTop: 5 }}>{t.items.length} items</Text>
                        </Pressable>
                    ))}
                </ScrollView>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18, marginVertical: 12 }}>Checklist</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Field placeholder="Add an item" value={item} onChangeText={setItem} style={{ flex: 1 }} />
                    <Pressable
                        style={[styles.button, { marginTop: 0, height: 50 }]}
                        onPress={() => {
                            if (item.trim()) {
                                setItems([...items, item.trim()]);
                                setItem('');
                            }
                        }}
                    >
                        <Text style={styles.buttonText}>Add</Text>
                    </Pressable>
                </View>
                {items.map((value, index) => (
                    <Pressable key={`${value}-${index}`} style={styles.card} onPress={() => setItems(items.filter((_, i) => i !== index))}>
                        <Text style={{ color: colors.text }}>○ {value}</Text>
                        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>Tap to remove</Text>
                    </Pressable>
                ))}
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18, marginVertical: 12 }}>Email reminders</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {offsets.map((o) => (
                        <Pressable
                            key={o.value}
                            onPress={() => setSelected(selected.includes(o.value) ? selected.filter((v) => v !== o.value) : [...selected, o.value])}
                            style={{
                                borderWidth: 1,
                                borderColor: selected.includes(o.value) ? '#60a5fa' : colors.border,
                                backgroundColor: selected.includes(o.value) ? '#172554' : colors.card,
                                padding: 11,
                                borderRadius: 10,
                            }}
                        >
                            <Text style={{ color: selected.includes(o.value) ? '#93c5fd' : colors.muted }}>{o.label} before</Text>
                        </Pressable>
                    ))}
                </View>
                <View style={{ height: 14 }} />
                <Button title={busy ? 'Creating…' : 'Create event'} disabled={busy || !title} onPress={submit} />
                <View style={{ height: 30 }} />
            </ScrollView>
        </Screen>
    );
}
