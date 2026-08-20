import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div className={cn('grid w-full grid-cols-3 gap-2', className)} {...props}>
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 text-sm font-semibold transition',
                        appearance === value
                            ? 'border-blue-500 bg-blue-500/10 text-blue-600 shadow-sm dark:text-blue-400'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-500/40 hover:bg-blue-500/5 dark:border-slate-700 dark:bg-[#080f20] dark:text-slate-300',
                    )}
                >
                    <Icon className="size-5" />
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
}
