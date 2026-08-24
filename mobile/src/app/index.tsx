import { useAuth } from '@/context/auth-context';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
export default function Index() {
    const { token, loading } = useAuth();
    if (loading)
        return (
            <View style={{ flex: 1, backgroundColor: '#080b14', justifyContent: 'center' }}>
                <ActivityIndicator color="#3b82f6" />
            </View>
        );
    return <Redirect href={token ? '/(tabs)/home' : '/auth'} />;
}
