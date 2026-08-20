import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, House, Plus } from 'lucide-react';

export function MobileBottomNav() {
    const { url } = usePage();
    const isHome = url === '/dashboard';
    const isEvents = url === '/events';

    return (
        <nav
            className="fixed inset-x-0 -bottom-px z-40 border-t border-slate-200 bg-white px-5 pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] md:hidden dark:border-white/10 dark:bg-[#050914]"
            aria-label="Mobile navigation"
        >
            <div className="mx-auto grid max-w-md grid-cols-3 items-end">
                <Link
                    href={route('dashboard')}
                    className={`flex flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${isHome ? 'text-blue-400' : 'text-slate-500'}`}
                >
                    <House className="size-5" strokeWidth={isHome ? 2.5 : 2} />
                    <span>Home</span>
                </Link>

                <Link
                    href={route('events.create')}
                    className="mx-auto flex size-14 items-center justify-center self-center rounded-2xl border-4 border-white bg-blue-600 text-white shadow-[0_10px_28px_rgba(37,99,235,0.4)] transition active:scale-95 dark:border-[#050914]"
                    aria-label="Add event"
                >
                    <Plus className="size-7" strokeWidth={2.5} />
                </Link>

                <Link
                    href={route('events.index')}
                    className={`flex flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${isEvents ? 'text-blue-400' : 'text-slate-500'}`}
                >
                    <CalendarDays className="size-5" strokeWidth={isEvents ? 2.5 : 2} />
                    <span>Events</span>
                </Link>
            </div>
        </nav>
    );
}
