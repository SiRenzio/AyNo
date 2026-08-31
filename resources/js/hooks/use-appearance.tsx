import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const applyReducedMotion = (enabled: boolean) => {
    document.documentElement.classList.toggle('reduce-motion', enabled);
};

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
};

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';

    applyTheme(savedAppearance);
    applyReducedMotion(localStorage.getItem('reduce-motion') === 'true');

    // Add the event listener for system theme changes...
    mediaQuery.addEventListener('change', handleSystemThemeChange);
}

export function useReducedMotion() {
    const [reducedMotion, setReducedMotion] = useState(false);

    const updateReducedMotion = (enabled: boolean) => {
        setReducedMotion(enabled);
        localStorage.setItem('reduce-motion', String(enabled));
        applyReducedMotion(enabled);
    };

    useEffect(() => {
        setReducedMotion(localStorage.getItem('reduce-motion') === 'true');
    }, []);

    return { reducedMotion, updateReducedMotion };
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');

    const updateAppearance = (mode: Appearance) => {
        setAppearance(mode);
        localStorage.setItem('appearance', mode);
        applyTheme(mode);
    };

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
        updateAppearance(savedAppearance || 'system');

        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, []);

    return { appearance, updateAppearance };
}
