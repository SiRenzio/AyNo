import Ionicons from '@expo/vector-icons/Ionicons';
import { PropsWithChildren, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, Text, TextInput, TextInputProps, View } from 'react-native';

import { Screen } from '@/components/native-ui';
import { useAppTheme } from '@/context/theme-context';

export function AuthScreen({
    mode,
    formProgress,
    onModeChange,
    submit,
    title,
    description,
    children,
}: PropsWithChildren<{
    mode: 'login' | 'register';
    formProgress: Animated.Value;
    onModeChange: (mode: 'login' | 'register') => void;
    submit: { title: string; onPress: () => void; disabled: boolean };
    title: string;
    description: string;
}>) {
    const { colors } = useAppTheme();
    return (
        <Screen>
            <View
                pointerEvents="none"
                style={{ position: 'absolute', top: -90, left: -100, width: 260, height: 260, borderRadius: 130, backgroundColor: '#2563eb16' }}
            />
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 28 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ width: '100%', maxWidth: 500, alignSelf: 'center' }}>
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
                            <View
                                style={{ width: 58, height: 58, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.card, marginRight: 13 }}
                            >
                                <Image
                                    source={require('../../assets/images/ayno-bird.png')}
                                    resizeMode="contain"
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </View>
                            <View>
                                <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }}>AyNo</Text>
                                <Text style={{ color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1.7 }}>NEVER LEAVE IT BEHIND</Text>
                            </View>
                        </View>
                        <Text style={{ color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -1 }}>{title}</Text>
                        <Text style={{ color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 7, marginBottom: 24 }}>{description}</Text>
                    </View>
                    <View>
                        <View
                            style={{
                                flexDirection: 'row',
                                padding: 4,
                                borderRadius: 13,
                                borderWidth: 1,
                                borderColor: colors.border,
                                backgroundColor: colors.card,
                                marginBottom: 24,
                            }}
                        >
                            <AuthTab active={mode === 'login'} label="Sign in" onPress={() => onModeChange('login')} />
                            <AuthTab active={mode === 'register'} label="Register" onPress={() => onModeChange('register')} />
                        </View>
                    </View>
                    <Animated.View
                        style={{
                            opacity: formProgress,
                        }}
                    >
                        {children}
                    </Animated.View>
                    <View>
                        <Pressable
                            disabled={submit.disabled}
                            onPress={submit.onPress}
                            style={{
                                backgroundColor: colors.primary,
                                borderRadius: 12,
                                alignItems: 'center',
                                padding: 14,
                                marginTop: 8,
                                opacity: submit.disabled ? 0.55 : 1,
                            }}
                        >
                            <Animated.Text style={{ color: '#fff', fontWeight: '700', opacity: formProgress }}>{submit.title}</Animated.Text>
                        </Pressable>
                    </View>
                    <Text style={{ textAlign: 'center', color: colors.muted, fontSize: 11, marginTop: 28 }}>AyNo Personal Reminder Checklist</Text>
                </View>
            </ScrollView>
        </Screen>
    );
}

function AuthTab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
    const { colors } = useAppTheme();
    return (
        <Pressable
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 9, backgroundColor: active ? colors.primary : 'transparent' }}
        >
            <Text style={{ color: active ? '#fff' : colors.muted, fontWeight: '700' }}>{label}</Text>
        </Pressable>
    );
}

export function AuthField({ label, secure, ...props }: TextInputProps & { label: string; secure?: boolean }) {
    const { colors } = useAppTheme();
    const [visible, setVisible] = useState(false);
    return (
        <View style={{ marginBottom: 17 }}>
            <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>{label.toUpperCase()}</Text>
            <View>
                <TextInput
                    {...props}
                    autoComplete="off"
                    importantForAutofill="no"
                    secureTextEntry={secure && !visible}
                    placeholderTextColor={colors.muted}
                    selectionColor="#60a5fa"
                    cursorColor="#60a5fa"
                    underlineColorAndroid="transparent"
                    style={{
                        color: colors.text,
                        height: 52,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                        borderRadius: 12,
                        paddingHorizontal: 15,
                        paddingRight: secure ? 48 : 15,
                        fontSize: 15,
                    }}
                />
                {secure ? (
                    <Pressable
                        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
                        onPress={() => setVisible((value) => !value)}
                        style={{ position: 'absolute', right: 6, top: 6, padding: 10 }}
                    >
                        <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} />
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}
