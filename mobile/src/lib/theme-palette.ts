export const palettes = {
    light: { bg: '#f8fafc', card: '#ffffff', border: '#dbe3ef', text: '#0f172a', muted: '#64748b', primary: '#2563eb', danger: '#dc2626' },
    dark: { bg: '#080b14', card: '#111827', border: '#263149', text: '#f8fafc', muted: '#94a3b8', primary: '#2563eb', danger: '#ef4444' },
} as const;

export type AppTheme = keyof typeof palettes;
export type AppColors = (typeof palettes)[AppTheme];
