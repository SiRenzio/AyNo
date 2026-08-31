import { EventCard } from '@/components/event-card';
import { Field, Screen, styles } from '@/components/native-ui';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { api } from '@/lib/api';
import { EventSummary } from '@/lib/types';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
const filters = ['all', 'upcoming', 'overdue', 'completed', 'cancelled'];
export default function Events() {
    const { colors } = useAppTheme();
    const { token } = useAuth();
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const load = useCallback(async () => {
        try {
            const result = await api<{ events: EventSummary[] }>('/events', {}, token);
            setEvents(result.events);
        } finally {
            setLoading(false);
        }
    }, [token]);
    useFocusEffect(
        useCallback(() => {
            load();
        }, [load]),
    );
    const visible = useMemo(
        () =>
            events.filter(
                (e) => (filter === 'all' || e.status === filter) && `${e.title} ${e.location ?? ''}`.toLowerCase().includes(query.toLowerCase()),
            ),
        [events, filter, query],
    );
    return (
        <Screen>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={visible}
                keyExtractor={(e) => String(e.id)}
                onRefresh={load}
                refreshing={loading}
                ListHeaderComponent={
                    <View>
                        <Text style={[styles.title, { color: colors.text }]}>Events</Text>
                        <Text style={[styles.subtitle, { color: colors.muted }]}>Search and manage your timeline.</Text>
                        <Field placeholder="Search events" value={query} onChangeText={setQuery} />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
                            {filters.map((value) => (
                                <Pressable
                                    key={value}
                                    onPress={() => setFilter(value)}
                                    style={{
                                        backgroundColor: filter === value ? '#1d4ed8' : colors.card,
                                        borderColor: filter === value ? '#3b82f6' : colors.border,
                                        borderWidth: 1,
                                        paddingHorizontal: 15,
                                        paddingVertical: 9,
                                        borderRadius: 20,
                                        marginRight: 8,
                                    }}
                                >
                                    <Text style={{ color: filter === value ? 'white' : colors.muted, textTransform: 'capitalize' }}>{value}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                        <Text style={{ color: colors.muted, marginBottom: 12 }}>{visible.length} matching events</Text>
                    </View>
                }
                ListEmptyComponent={<Text style={{ color: colors.muted }}>No events match these filters.</Text>}
                renderItem={({ item }) => <EventCard event={item} />}
            />
        </Screen>
    );
}
