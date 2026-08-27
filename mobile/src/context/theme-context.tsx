import { sessionStorage } from '@/lib/session-storage';
import { AppColors, AppTheme, palettes } from '@/lib/theme-palette';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

type ThemeContextValue = {
    mode: AppTheme;
    colors: AppColors;
    setMode: (mode: AppTheme) => void;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
    const systemMode: AppTheme = Appearance.getColorScheme() === 'light' ? 'light' : 'dark';
    const savedMode = sessionStorage.getSync('appearance');
    const [mode, setModeState] = useState<AppTheme>(savedMode === 'light' || savedMode === 'dark' ? savedMode : systemMode);

    const setMode = (next: AppTheme) => {
        setModeState(next);
        Appearance.setColorScheme(next as ColorSchemeName);
        void sessionStorage.set('appearance', next);
    };

    useEffect(() => Appearance.setColorScheme(mode), [mode]);

    const value = useMemo(() => ({ mode, colors: palettes[mode], setMode, toggleTheme: () => setMode(mode === 'dark' ? 'light' : 'dark') }), [mode]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
    const value = useContext(ThemeContext);
    if (!value) throw new Error('useAppTheme must be used inside AppThemeProvider');
    return value;
}
