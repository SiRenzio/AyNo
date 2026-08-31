import { useAppTheme } from '@/context/theme-context';
import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children }: PropsWithChildren) {
    const { colors } = useAppTheme();
    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={[styles.screen, { backgroundColor: colors.bg }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0} style={styles.inner}>
                {children}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export function Field(props: TextInputProps) {
    const { colors } = useAppTheme();
    return (
        <TextInput
            placeholderTextColor={colors.muted}
            {...props}
            style={[styles.field, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }, props.style]}
        />
    );
}

export function Button({ title, onPress, danger, disabled }: { title: string; onPress: () => void; danger?: boolean; disabled?: boolean }) {
    const { colors } = useAppTheme();
    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={[styles.button, { backgroundColor: danger ? colors.danger : colors.primary }, disabled && { opacity: 0.55 }]}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </Pressable>
    );
}

const baseStyles = StyleSheet.create({
    screen: { flex: 1 },
    inner: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
    title: { fontSize: 30, fontWeight: '800' },
    subtitle: { marginTop: 6, marginBottom: 24, fontSize: 15 },
    field: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    button: { borderRadius: 12, alignItems: 'center', padding: 14, marginTop: 8 },
    buttonText: { color: 'white', fontWeight: '700' },
    card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
});

export const styles = baseStyles;
