import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { colors } from './native-ui';
import { EventSummary } from '@/lib/types';

const statusColor: Record<string, string> = { upcoming: '#60a5fa', overdue: '#fbbf24', completed: '#34d399', cancelled: '#94a3b8' };

export function EventCard({ event }: { event: EventSummary }) {
  const progress = event.checklist_count ? Math.round(event.completed_checklist_count / event.checklist_count * 100) : 0;
  const accent = statusColor[event.status] ?? colors.muted;

  return <Pressable onPress={() => router.push(`/events/${event.id}`)} style={{ backgroundColor: '#091122', borderColor: '#1e293b', borderWidth: 1, borderRadius: 16, padding: 17, marginBottom: 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <View style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{event.title}</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 }}><Ionicons name="time-outline" size={16} color={colors.muted} /><Text style={{ color: colors.muted, fontSize: 13 }}>{new Date(event.starts_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text></View></View>
      <View style={{ borderWidth: 1, borderColor: `${accent}55`, backgroundColor: `${accent}18`, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}><Text style={{ color: accent, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>{event.status}</Text></View>
    </View>
    {event.location ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 }}><Ionicons name="location-outline" size={16} color={colors.muted} /><Text numberOfLines={1} style={{ color: colors.muted, fontSize: 13, flex: 1 }}>{event.location}</Text></View> : null}
    <View style={{ borderTopColor: '#1e293b', borderTopWidth: 1, marginTop: 17, paddingTop: 14 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}><View style={{ flexDirection: 'row', gap: 6 }}><Ionicons name="list-outline" size={16} color={colors.muted} /><Text style={{ color: colors.muted, fontSize: 12 }}>Checklist</Text></View><Text style={{ color: progress === 100 && event.checklist_count ? '#34d399' : colors.muted, fontSize: 12 }}>{event.checklist_count ? `${event.completed_checklist_count} of ${event.checklist_count}` : 'No items'}</Text></View><View style={{ height: 6, borderRadius: 6, backgroundColor: '#1e293b', overflow: 'hidden' }}><View style={{ height: 6, width: `${progress}%`, borderRadius: 6, backgroundColor: progress === 100 ? '#34d399' : '#3b82f6' }} /></View></View>
  </Pressable>;
}
