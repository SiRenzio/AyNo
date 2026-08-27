import { useAppTheme } from '@/context/theme-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export function ConfirmDialog({ visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, onCancel, onConfirm }: Props) {
    const { colors } = useAppTheme();
    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
            <View style={dialogStyles.backdrop}>
                <View style={[dialogStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[dialogStyles.icon, { backgroundColor: danger ? '#ef44441a' : '#2563eb1a' }]}>
                        <Ionicons
                            name={danger ? 'warning-outline' : 'help-circle-outline'}
                            size={24}
                            color={danger ? colors.danger : colors.primary}
                        />
                    </View>
                    <Text style={[dialogStyles.title, { color: colors.text }]}>{title}</Text>
                    <Text style={[dialogStyles.message, { color: colors.muted }]}>{message}</Text>
                    <View style={dialogStyles.actions}>
                        <Pressable onPress={onCancel} style={[dialogStyles.button, { borderColor: colors.border }]}>
                            <Text style={{ color: colors.text, fontWeight: '700' }}>{cancelLabel}</Text>
                        </Pressable>
                        <Pressable
                            onPress={onConfirm}
                            style={[dialogStyles.button, { backgroundColor: danger ? colors.danger : colors.primary, borderColor: 'transparent' }]}
                        >
                            <Text style={{ color: '#fff', fontWeight: '700' }}>{confirmLabel}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const dialogStyles = StyleSheet.create({
    backdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#020617b8' },
    card: { borderWidth: 1, borderRadius: 24, padding: 22, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 24, elevation: 12 },
    icon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, marginBottom: 18 },
    title: { fontSize: 21, fontWeight: '800' },
    message: { marginTop: 9, fontSize: 15, lineHeight: 22 },
    actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
    button: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: 1 },
});
