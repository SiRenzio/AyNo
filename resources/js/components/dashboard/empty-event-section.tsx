import { EventCard } from '@/components/events/event-card';
import { ManagedEvent } from '@/components/events/event-types';
import { Link } from '@inertiajs/react';
import { CalendarDays, type LucideIcon } from 'lucide-react';

interface EmptyStateAction {
    label: string;
    href: string;
    icon: LucideIcon;
}

interface EmptyEventSectionProps {
    title: string;
    count: number;
    emptyTitle: string;
    emptyDescription: string;
    accent: 'blue' | 'green';
    action?: EmptyStateAction;
    events?: ManagedEvent[];
}

const accentClasses = {
    blue: { marker: 'bg-blue-500', icon: 'bg-blue-500/10 text-blue-400' },
    green: { marker: 'bg-emerald-400', icon: 'bg-emerald-400/10 text-emerald-400' },
};

export function EmptyEventSection({ title, count, emptyTitle, emptyDescription, accent, action, events = [] }: EmptyEventSectionProps) {
    const colors = accentClasses[accent];
    const ActionIcon = action?.icon;

    return (
        <section>
            <div className="mb-4 flex items-center gap-3">
                <span className={`h-5 w-1 rounded-full ${colors.marker}`} />
                <h2 className="text-xs font-bold tracking-[0.18em] text-slate-600 uppercase sm:text-sm dark:text-slate-300">{title}</h2>
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-white/[0.06] dark:text-slate-300">
                    {count}
                </span>
            </div>

            {events.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-8 text-center sm:min-h-52 sm:px-6 sm:py-10 dark:border-white/10 dark:bg-[#0a1425]/70">
                    <span className={`flex size-12 items-center justify-center rounded-2xl ${colors.icon}`}>
                        <CalendarDays className="size-6" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">{emptyTitle}</h3>
                    <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">{emptyDescription}</p>

                    {action && ActionIcon && (
                        <Link
                            href={action.href}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                        >
                            <ActionIcon className="size-4" />
                            {action.label}
                        </Link>
                    )}
                </div>
            )}
        </section>
    );
}
