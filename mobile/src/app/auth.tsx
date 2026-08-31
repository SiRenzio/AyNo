import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Easing, LayoutAnimation, Text } from 'react-native';

import { AuthField, AuthScreen } from '@/components/auth-screen';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { ApiError } from '@/lib/api';

type Mode = 'login' | 'register';
type FieldErrors = Partial<Record<'login' | 'username' | 'email' | 'password' | 'password_confirmation', string>>;

export default function Auth() {
    useAppTheme();
    const { signIn, signUp } = useAuth();
    const [mode, setMode] = useState<Mode>('login');
    const [username, setUsername] = useState('');
    const [login, setLogin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [busy, setBusy] = useState(false);
    const [transitioning, setTransitioning] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const formProgress = useRef(new Animated.Value(1)).current;

    function changeMode(nextMode: Mode) {
        if (busy || transitioning || nextMode === mode) return;
        setTransitioning(true);
        setErrors({});
        Animated.timing(formProgress, {
            toValue: 0,
            duration: 260,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (!finished) return;
            LayoutAnimation.configureNext({ duration: 420, update: { type: LayoutAnimation.Types.easeInEaseOut } });
            setMode(nextMode);
            setPassword('');
            setConfirm('');
            formProgress.setValue(0);
            Animated.timing(formProgress, {
                toValue: 1,
                duration: 420,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start(() => setTransitioning(false));
        });
    }

    async function submit() {
        setBusy(true);
        setErrors({});
        try {
            if (mode === 'login') await signIn({ login, password });
            else await signUp({ username, email, password, password_confirmation: confirm });
            router.replace('/(tabs)/home');
        } catch (error) {
            if (error instanceof ApiError) {
                const fieldErrors = Object.fromEntries(Object.entries(error.errors).map(([field, messages]) => [field, messages[0]])) as FieldErrors;
                if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
                else setErrors({ [mode === 'login' ? 'login' : 'email']: error.message });
            } else {
                setErrors({ [mode === 'login' ? 'login' : 'email']: error instanceof Error ? error.message : 'Try again.' });
            }
        } finally {
            setBusy(false);
        }
    }

    const disabled = busy || !password || (mode === 'login' ? !login : !username || !email || !confirm || password !== confirm);
    return (
        <AuthScreen
            mode={mode}
            formProgress={formProgress}
            onModeChange={changeMode}
            submit={{
                title: busy ? (mode === 'login' ? 'Signing in…' : 'Creating…') : mode === 'login' ? 'Sign in' : 'Create account',
                onPress: submit,
                disabled,
            }}
            title={mode === 'login' ? 'Welcome back' : 'Create your account'}
            description={
                mode === 'login'
                    ? 'Sign in to access your reminders and upcoming events.'
                    : 'Start organizing the things you cannot afford to forget.'
            }
        >
            {mode === 'register' ? (
                <AuthField
                    label="Username"
                    autoCapitalize="none"
                    placeholder="Choose a username"
                    value={username}
                    error={errors.username}
                    onChangeText={(value) => {
                        setUsername(value);
                        setErrors((current) => ({ ...current, username: undefined }));
                    }}
                />
            ) : null}
            {mode === 'login' ? (
                <AuthField
                    label="Username or email"
                    autoCapitalize="none"
                    placeholder="Username or email address"
                    value={login}
                    error={errors.login}
                    onChangeText={(value) => {
                        setLogin(value);
                        setErrors((current) => ({ ...current, login: undefined }));
                    }}
                />
            ) : (
                <AuthField
                    label="Email address"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="you@email.com"
                    value={email}
                    error={errors.email}
                    onChangeText={(value) => {
                        setEmail(value);
                        setErrors((current) => ({ ...current, email: undefined }));
                    }}
                />
            )}
            <AuthField
                label="Password"
                secure
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={mode === 'login' ? 'Enter your password' : 'Create password'}
                value={password}
                error={errors.password}
                onChangeText={(value) => {
                    setPassword(value);
                    setErrors((current) => ({ ...current, password: undefined }));
                }}
            />
            {mode === 'register' ? (
                <AuthField
                    label="Confirm password"
                    secure
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={confirm}
                    error={errors.password_confirmation}
                    onChangeText={(value) => {
                        setConfirm(value);
                        setErrors((current) => ({ ...current, password_confirmation: undefined }));
                    }}
                />
            ) : null}
            {mode === 'register' ? (
                <Text style={{ color: '#475569', textAlign: 'center', fontSize: 11, lineHeight: 17, marginTop: 14 }}>
                    By creating an account, you agree to keep your reminder information accurate and secure.
                </Text>
            ) : null}
        </AuthScreen>
    );
}
