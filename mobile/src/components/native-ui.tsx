import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colors = { bg: '#080b14', card: '#111827', border: '#263149', text: '#f8fafc', muted: '#94a3b8', primary: '#2563eb', danger: '#ef4444' };

export function Screen({ children }: PropsWithChildren) {
    return (
        <SafeAreaView edges={['left', 'right']} style={styles.screen}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0} style={styles.inner}>
                {children}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export function Field(props: TextInputProps) {
    return <TextInput placeholderTextColor="#64748b" {...props} style={[styles.field, props.style]} />;
}

export function Button({ title, onPress, danger, disabled }: { title: string; onPress: () => void; danger?: boolean; disabled?: boolean }) {
    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={[styles.button, danger && { backgroundColor: colors.danger }, disabled && { opacity: 0.55 }]}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </Pressable>
    );
}

export const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    inner: { flex: 1, padding: 20 },
    title: { color: colors.text, fontSize: 30, fontWeight: '800' },
    subtitle: { color: colors.muted, marginTop: 6, marginBottom: 24, fontSize: 15 },
    field: {
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    button: { backgroundColor: colors.primary, borderRadius: 12, alignItems: 'center', padding: 14, marginTop: 8 },
    buttonText: { color: 'white', fontWeight: '700' },
    card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginBottom: 12 },
});
