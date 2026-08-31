import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { SlidersHorizontal, UserRound } from 'lucide-react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        url: '/settings/profile',
        icon: UserRound,
    },
    {
        title: 'Customize',
        url: '/settings/appearance',
        icon: SlidersHorizontal,
    },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = usePage().url;

    return (
        <main className="flex-1 bg-slate-50 px-4 py-6 pb-28 text-slate-950 sm:px-7 sm:py-8 md:pb-8 lg:px-8 dark:bg-[#050b18] dark:text-white">
            <div className="mx-auto max-w-5xl">
                <header className="mb-7">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Manage your profile and personalize your experience.</p>
                </header>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-7">
                    <aside className="w-full lg:sticky lg:top-6 lg:w-56 lg:shrink-0">
                        <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 lg:grid-cols-1 dark:border-slate-800 dark:bg-[#091122]">
                            {sidebarNavItems.map((item) => (
                                <Link
                                    key={item.url}
                                    href={item.url}
                                    prefetch
                                    className={cn(
                                        'flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-xs font-semibold transition lg:justify-start lg:px-3 lg:text-sm',
                                        currentPath === item.url
                                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-950/20'
                                            : 'text-slate-600 hover:bg-blue-500/10 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400',
                                    )}
                                >
                                    {item.icon && <item.icon className="size-4 shrink-0" />}
                                    <span className="hidden min-[380px]:inline">{item.title}</span>
                                </Link>
                            ))}
                        </nav>
                    </aside>
                    <div className="min-w-0 flex-1">
                        <section className="space-y-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-[#091122] [&_input]:border-slate-300 [&_input]:bg-slate-50 [&_input]:focus-visible:border-blue-500 [&_input]:focus-visible:ring-blue-500/20 dark:[&_input]:border-slate-700 dark:[&_input]:bg-[#080f20]">
                            {children}
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
