import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
export default function Index() {
    const { token, loading } = useAuth();
    const { colors } = useAppTheme();
    if (loading)
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
                <ActivityIndicator color="#3b82f6" />
            </View>
        );
    return <Redirect href={token ? '/(tabs)/home' : '/auth'} />;
}
