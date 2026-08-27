import { Button, Field, Screen, styles } from '@/components/native-ui';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { api } from '@/lib/api';
import { EventDetail } from '@/lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
export default function EditEvent() {
    const { colors } = useAppTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { token } = useAuth();
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState<'date' | 'time' | null>(null);
    useEffect(() => {
        api<{ event: EventDetail }>(`/events/${id}`, {}, token).then(({ event }) => {
            setTitle(event.title);
            setLocation(event.location ?? '');
            setNotes(event.notes ?? '');
            setDate(new Date(event.starts_at));
        });
    }, [id, token]);
    async function save() {
        try {
            await api(
                `/events/${id}`,
                { method: 'PATCH', body: JSON.stringify({ title, location: location || null, notes: notes || null, starts_at: date.toISOString() }) },
                token,
            );
            router.back();
        } catch (e) {
            Alert.alert('Unable to save', e instanceof Error ? e.message : 'Try again.');
        }
    }
    return (
        <Screen>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Pressable
                    onPress={() => router.back()}
                    style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 16, paddingVertical: 6 }}
                >
                    <Ionicons name="chevron-back" size={20} color={colors.muted} />
                    <Text style={{ color: colors.muted, fontWeight: '600' }}>Back</Text>
                </Pressable>
                <Text style={[styles.title, { color: colors.text }]}>Edit event</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>Update the event details and schedule.</Text>
                <Field placeholder="Title" value={title} onChangeText={setTitle} />
                <Field placeholder="Location" value={location} onChangeText={setLocation} />
                <Field placeholder="Notes" value={notes} onChangeText={setNotes} multiline style={{ minHeight: 100, textAlignVertical: 'top' }} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable
                        style={[styles.card, { flex: 1, backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => setMode('date')}
                    >
                        <Text style={{ color: colors.muted }}>Date</Text>
                        <Text style={{ color: colors.text }}>{date.toLocaleDateString()}</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.card, { flex: 1, backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => setMode('time')}
                    >
                        <Text style={{ color: colors.muted }}>Time</Text>
                        <Text style={{ color: colors.text }}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
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
                <Button title="Save changes" disabled={!title} onPress={save} />
            </ScrollView>
        </Screen>
    );
}
