import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { EventCard } from '@/components/event-card';
import { Screen, colors, styles } from '@/components/native-ui';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { DashboardData, EventSummary } from '@/lib/types';

const statCards = [
  { key: 'total', label: 'Total Events', color: '#60a5fa' },
  { key: 'upcoming', label: 'Upcoming', color: '#60a5fa' },
  { key: 'overdue', label: 'Overdue', color: '#fbbf24' },
  { key: 'completed', label: 'Completed', color: '#34d399' },
] as const;

function EventSection({ title, events, color, emptyTitle, emptyDescription, action, onAction }: { title: string; events: EventSummary[]; color: string; emptyTitle: string; emptyDescription: string; action: string; onAction: () => void }) {
  return <View style={{ marginBottom: 28 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}><View style={{ width: 4, height: 20, borderRadius: 4, backgroundColor: color }} /><Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' }}>{title}</Text><View style={{ backgroundColor: '#ffffff0f', borderRadius: 14, paddingHorizontal: 9, paddingVertical: 3 }}><Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: '700' }}>{events.length}</Text></View></View>{events.length ? events.map(event => <EventCard key={event.id} event={event} />) : <View style={{ minHeight: 190, borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: '#ffffff1a', backgroundColor: '#0a1425b5', alignItems: 'center', justifyContent: 'center', padding: 24 }}><View style={{ width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: `${color}18` }}><Ionicons name="calendar-outline" size={25} color={color} /></View><Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 15 }}>{emptyTitle}</Text><Text style={{ color: colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 7 }}>{emptyDescription}</Text><Pressable onPress={onAction} style={{ marginTop: 18, backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 11, flexDirection: 'row', alignItems: 'center', gap: 7 }}><Ionicons name={title === 'Upcoming' ? 'add' : 'calendar-outline'} size={17} color="white" /><Text style={{ color: 'white', fontWeight: '700' }}>{action}</Text></Pressable></View>}</View>;
}

export default function Home() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => { const result = await api<DashboardData>(`/dashboard?fresh=${Date.now()}`, {}, token); setData(result); }, [token]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  async function refresh() { setRefreshing(true); try { await load(); } finally { setRefreshing(false); } }

  return <Screen><ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#60a5fa" />} showsVerticalScrollIndicator={false}><View style={{ borderBottomWidth: 1, borderBottomColor: '#ffffff12', paddingBottom: 22, marginBottom: 22 }}><Text style={styles.title}>Dashboard</Text><Text style={{ color: '#cbd5e1', marginTop: 6 }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text></View><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>{statCards.map(card => <View key={card.key} style={{ width: '48%', backgroundColor: '#0d1729', borderColor: '#ffffff14', borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 17 }}><Text style={{ color: card.color, fontSize: 27, fontWeight: '800', letterSpacing: -0.5 }}>{data?.statistics[card.key] ?? 0}</Text><Text style={{ color: '#cbd5e1', fontSize: 13, marginTop: 5 }}>{card.label}</Text></View>)}</View><EventSection title="Upcoming" events={data?.upcoming_events ?? []} color="#3b82f6" emptyTitle="No upcoming events yet" emptyDescription="Create your first event and add everything you need to remember before leaving." action="Add New Event" onAction={() => router.push('/(tabs)/create')} /><EventSection title="Recently Completed" events={data?.completed_events ?? []} color="#34d399" emptyTitle="No completed events yet" emptyDescription="Events you finish will appear here so you can quickly review what you accomplished." action="Manage Events" onAction={() => router.push('/(tabs)')} /></ScrollView></Screen>;
}
