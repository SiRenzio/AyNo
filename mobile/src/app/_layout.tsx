import { GlobalLoading } from '@/components/global-loading';
import { NotificationSync } from '@/components/notification-sync';
import { ReverbSync } from '@/components/reverb-sync';
import { AuthProvider } from '@/context/auth-context';
import { AppThemeProvider, useAppTheme } from '@/context/theme-context';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
    return (
        <AppThemeProvider>
            <AuthProvider>
                <NotificationSync />
                <ReverbSync />
                <GlobalLoading />
                <ThemedNavigation />
            </AuthProvider>
        </AppThemeProvider>
    );
}

function ThemedNavigation() {
    const { mode, colors } = useAppTheme();
    const base = mode === 'dark' ? DarkTheme : DefaultTheme;
    const theme = {
        ...base,
        colors: { ...base.colors, primary: '#3b82f6', background: colors.bg, card: colors.card, border: colors.border, text: colors.text },
    };
    return (
        <ThemeProvider value={theme}>
            <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.bg },
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="events/[id]" />
            </Stack>
        </ThemeProvider>
    );
}
