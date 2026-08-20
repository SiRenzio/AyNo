import { Link } from '@inertiajs/react';
import { CalendarClock, CheckCircle2, ListChecks, MapPin } from 'lucide-react';
import { ManagedEvent } from './event-types';

const statusStyles = {
    upcoming: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    overdue: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    completed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    cancelled: 'border-slate-600 bg-slate-700/30 text-slate-600 dark:text-slate-300',
};
const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export function EventCard({ event }: { event: ManagedEvent }) {
    const progress = event.checklist_count ? Math.round((event.completed_checklist_count / event.checklist_count) * 100) : 0;
    return (
        <Link
            href={route('events.show', event.id)}
            className="group block rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-500/40 sm:p-5 dark:border-slate-800 dark:bg-[#091122]"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="truncate font-semibold text-slate-950 dark:text-white">{event.title}</h2>
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <CalendarClock className="size-4 shrink-0" />
                        {dateFormat.format(new Date(event.starts_at))}
                    </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyles[event.status]}`}>
                    {event.status}
                </span>
            </div>
            {event.location && (
                <p className="mt-3 flex items-center gap-2 truncate text-sm text-slate-600 dark:text-slate-300">
                    <MapPin className="size-4 shrink-0" />
                    {event.location}
                </p>
            )}
            {event.notes && <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{event.notes}</p>}
            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <ListChecks className="size-4" />
                        Checklist
                    </span>
                    <span className={progress === 100 && event.checklist_count ? 'text-emerald-400' : 'text-slate-600 dark:text-slate-300'}>
                        {event.checklist_count ? `${event.completed_checklist_count} of ${event.checklist_count}` : 'No items'}
                    </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-400' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                </div>
            </div>
            {event.status === 'completed' && <CheckCircle2 className="mt-4 size-4 text-emerald-400" />}
        </Link>
    );
}
