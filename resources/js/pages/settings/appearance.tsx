import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import { useReducedMotion } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Activity } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    const { reducedMotion, updateReducedMotion } = useReducedMotion();
    return (
        <AppLayout breadcrumbs={breadcrumbs} className="bg-slate-50 dark:bg-[#030817]">
            <Head title="Customization" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Theme" description="Choose how AyNo looks on this device" />
                    <AppearanceTabs />
                </div>
                <div className="space-y-4">
                    <HeadingSmall title="Motion" description="Adjust interface animations to your comfort" />
                    <button
                        type="button"
                        role="switch"
                        aria-checked={reducedMotion}
                        onClick={() => updateReducedMotion(!reducedMotion)}
                        className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-500/50 dark:border-slate-700 dark:bg-[#080f20]"
                    >
                        <span className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Activity className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold">Reduce motion</span>
                            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                                Minimize transitions and animated effects.
                            </span>
                        </span>
                        <span
                            className={`relative h-6 w-11 rounded-full transition ${reducedMotion ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                            <span
                                className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${reducedMotion ? 'left-6' : 'left-1'}`}
                            />
                        </span>
                    </button>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
