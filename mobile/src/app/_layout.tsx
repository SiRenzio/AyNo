import { GlobalLoading } from '@/components/global-loading';
import { ReverbSync } from '@/components/reverb-sync';
import { NotificationSync } from '@/components/notification-sync';
import { AuthProvider } from '@/context/auth-context';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, primary: '#3b82f6', background: '#080b14', card: '#0f1422', border: '#263149' } };
export default function RootLayout() {
    return (
        <AuthProvider>
            <NotificationSync />
            <ReverbSync />
            <GlobalLoading />
            <ThemeProvider value={theme}>
                <StatusBar style="light" />
                <Stack
                    screenOptions={{
                        headerStyle: { backgroundColor: '#0f1422' },
                        headerTintColor: '#f8fafc',
                        contentStyle: { backgroundColor: '#080b14' },
                    }}
                >
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="auth" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="events/[id]" options={{ title: 'Event details' }} />
                </Stack>
            </ThemeProvider>
        </AuthProvider>
    );
}
