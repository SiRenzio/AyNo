import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, DeviceEventEmitter, Easing, Text } from 'react-native';

export function GlobalLoading() {
    const [rendered, setRendered] = useState(false);
    const renderedRef = useRef(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        function clearDelay() {
            if (timer.current) clearTimeout(timer.current);
            timer.current = null;
        }
        function show() {
            clearDelay();
            timer.current = setTimeout(() => {
                renderedRef.current = true;
                setRendered(true);
                Animated.timing(progress, {
                    toValue: 1,
                    duration: 260,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }).start();
            }, 180);
        }
        function hide() {
            clearDelay();
            if (!renderedRef.current) return;
            Animated.timing(progress, {
                toValue: 0,
                duration: 220,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (!finished) return;
                renderedRef.current = false;
                setRendered(false);
            });
        }
        const subscription = DeviceEventEmitter.addListener('apiLoadingChanged', (count: number) => {
            if (count > 0) show(); else hide();
        });
        return () => {
            subscription.remove();
            clearDelay();
            progress.stopAnimation();
        };
    }, [progress]);

    if (!rendered) return null;
    return (
        <Animated.View
            pointerEvents="none"
            style={{
                position: 'absolute',
                zIndex: 1000,
                elevation: 20,
                top: 46,
                alignSelf: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                borderRadius: 18,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: '#172554ee',
                borderWidth: 1,
                borderColor: '#3b82f666',
                opacity: progress,
                transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-70, 0] }) }],
            }}
        >
            <ActivityIndicator size="small" color="#93c5fd" />
            <Text style={{ color: '#dbeafe', fontSize: 12, fontWeight: '700' }}>Loading…</Text>
        </Animated.View>
    );
}
