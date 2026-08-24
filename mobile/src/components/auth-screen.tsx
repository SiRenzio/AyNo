import Ionicons from '@expo/vector-icons/Ionicons';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, ScrollView, Text, TextInput, TextInputProps, View } from 'react-native';

import { Screen, colors } from '@/components/native-ui';

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
    const headerPosition = useRef(new Animated.Value(mode === 'register' ? 1 : 0)).current;
    useEffect(() => {
        Animated.timing(headerPosition, {
            toValue: mode === 'register' ? 1 : 0,
            duration: 420,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [headerPosition, mode]);
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
                    <Animated.View
                        style={{
                            transform: [{ translateY: headerPosition.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }],
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
                            <View
                                style={{ width: 58, height: 58, borderRadius: 18, overflow: 'hidden', backgroundColor: '#102450', marginRight: 13 }}
                            >
                                <Image
                                    source={require('../../assets/images/ayno-bird.png')}
                                    resizeMode="contain"
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </View>
                            <View>
                                <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }}>AyNo</Text>
                                <Text style={{ color: '#64748b', fontSize: 9, fontWeight: '700', letterSpacing: 1.7 }}>NEVER LEAVE IT BEHIND</Text>
                            </View>
                        </View>
                        <Text style={{ color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -1 }}>{title}</Text>
                        <Text style={{ color: '#94a3b8', fontSize: 15, lineHeight: 22, marginTop: 7, marginBottom: 24 }}>{description}</Text>
                    </Animated.View>
                    <Animated.View
                        style={{
                            transform: [{ translateY: headerPosition.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }],
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                padding: 4,
                                borderRadius: 13,
                                borderWidth: 1,
                                borderColor: '#ffffff0d',
                                backgroundColor: '#ffffff0e',
                                marginBottom: 24,
                            }}
                        >
                            <AuthTab active={mode === 'login'} label="Sign in" onPress={() => onModeChange('login')} />
                            <AuthTab active={mode === 'register'} label="Register" onPress={() => onModeChange('register')} />
                        </View>
                    </Animated.View>
                    <Animated.View
                        style={{
                            opacity: formProgress,
                            transform: [{ translateY: headerPosition.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }],
                        }}
                    >
                        {children}
                    </Animated.View>
                    <Animated.View style={{ transform: [{ translateY: headerPosition.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }] }}>
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
                    </Animated.View>
                    <Text style={{ textAlign: 'center', color: '#475569', fontSize: 11, marginTop: 28 }}>AyNo Personal Reminder Checklist</Text>
                </View>
            </ScrollView>
        </Screen>
    );
}

function AuthTab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 9, backgroundColor: active ? '#162a50' : 'transparent' }}
        >
            <Text style={{ color: active ? '#fff' : '#64748b', fontWeight: '700' }}>{label}</Text>
        </Pressable>
    );
}

export function AuthField({ label, secure, ...props }: TextInputProps & { label: string; secure?: boolean }) {
    const [visible, setVisible] = useState(false);
    return (
        <View style={{ marginBottom: 17 }}>
            <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>{label.toUpperCase()}</Text>
            <View>
                <TextInput
                    {...props}
                    autoComplete="off"
                    importantForAutofill="no"
                    secureTextEntry={secure && !visible}
                    placeholderTextColor="#475569"
                    selectionColor="#60a5fa"
                    cursorColor="#60a5fa"
                    underlineColorAndroid="transparent"
                    style={{
                        color: '#f8fafc',
                        height: 52,
                        borderWidth: 1,
                        borderColor: '#ffffff22',
                        backgroundColor: '#ffffff0e',
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
                        <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={19} color="#64748b" />
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}
