import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button, Field, Screen, styles } from '@/components/native-ui';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { api } from '@/lib/api';
import { getNotificationsModule, notificationsAvailable } from '@/lib/local-notifications';
import { sessionStorage } from '@/lib/session-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';

export default function Profile() {
    const { user, token, signOut } = useAuth();
    const { mode, colors, toggleTheme } = useAppTheme();
    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [compact, setCompact] = useState(false);
    const [showSignOut, setShowSignOut] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);

    useEffect(() => {
        setName(user?.name ?? '');
        setEmail(user?.email ?? '');
    }, [user]);
    useEffect(() => {
        sessionStorage.get('compact-layout').then((value) => setCompact(value === 'true'));
    }, []);

    async function profile() {
        try {
            await api('/profile', { method: 'PATCH', body: JSON.stringify({ name, email }) }, token);
            Alert.alert('Saved', 'Profile details updated.');
        } catch (error) {
            Alert.alert('Unable to save', error instanceof Error ? error.message : 'Try again.');
        }
    }

    function updateCompact(value: boolean) {
        setCompact(value);
        void sessionStorage.set('compact-layout', String(value));
    }

    async function deleteAccount() {
        await api('/account', { method: 'DELETE' }, token);
        if (notificationsAvailable) await (await getNotificationsModule()).cancelAllScheduledNotificationsAsync();
        await signOut();
        router.replace('/auth');
    }

    return (
        <Screen>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: compact ? 16 : 30 }}>
                <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>Manage your profile and personalize AyNo.</Text>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18, marginBottom: 12 }}>Profile</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Field placeholder="Name" value={name} onChangeText={setName} />
                    <Field autoCapitalize="none" keyboardType="email-address" placeholder="Email" value={email} onChangeText={setEmail} />
                    <Button title="Save profile" onPress={profile} />
                </View>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18, marginVertical: 12 }}>Customization</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, gap: compact ? 10 : 16 }]}>
                    <View style={{ minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <View
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 13,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#2563eb1a',
                            }}
                        >
                            <Ionicons name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={22} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text, fontWeight: '700' }}>
                                {mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            </Text>
                            <Text style={{ color: colors.muted, marginTop: 3, fontSize: 12 }}>Changes the theme across the whole app.</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="moon" size={13} color={mode === 'dark' ? colors.primary : colors.muted} />
                                <Switch
                                    accessibilityLabel="Dark mode on the left, light mode on the right"
                                    value={mode === 'light'}
                                    onValueChange={toggleTheme}
                                    trackColor={{ false: '#334155', true: '#bfdbfe' }}
                                    thumbColor={mode === 'light' ? '#f59e0b' : '#60a5fa'}
                                />
                                <Ionicons name="sunny" size={14} color={mode === 'light' ? '#f59e0b' : colors.muted} />
                            </View>
                            <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>Dark Light</Text>
                        </View>
                    </View>
                    <View style={{ height: 1, backgroundColor: colors.border }} />
                    <View style={{ minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <View
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 13,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#2563eb1a',
                            }}
                        >
                            <Ionicons name="contract-outline" size={22} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text, fontWeight: '700' }}>Compact layout</Text>
                            <Text style={{ color: colors.muted, marginTop: 3, fontSize: 12 }}>Use tighter spacing in settings.</Text>
                        </View>
                        <Switch
                            value={compact}
                            onValueChange={updateCompact}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>
                <Button title="Sign out" danger onPress={() => setShowSignOut(true)} />
                <Pressable
                    onPress={() => setShowDeleteAccount(true)}
                    style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 12 }}
                >
                    <Text style={{ color: colors.danger, fontWeight: '700' }}>Delete account and all data</Text>
                </Pressable>
            </ScrollView>
            <ConfirmDialog
                visible={showSignOut}
                title="Sign out?"
                message="You will need to sign in again to access your events."
                cancelLabel="Stay signed in"
                confirmLabel="Sign out"
                danger
                onCancel={() => setShowSignOut(false)}
                onConfirm={() => {
                    setShowSignOut(false);
                    void signOut().then(() => router.replace('/auth'));
                }}
            />
            <ConfirmDialog
                visible={showDeleteAccount}
                title="Delete this account?"
                message="This permanently erases your profile, events, checklist items, reminders, and notification history from this device. This cannot be undone."
                cancelLabel="Keep account"
                confirmLabel="Delete everything"
                danger
                onCancel={() => setShowDeleteAccount(false)}
                onConfirm={() => {
                    setShowDeleteAccount(false);
                    void deleteAccount();
                }}
            />
        </Screen>
    );
}
