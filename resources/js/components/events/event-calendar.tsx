import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ManagedEvent } from './event-types';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const statusDot = { upcoming: 'bg-blue-400', overdue: 'bg-amber-400', completed: 'bg-emerald-400', cancelled: 'bg-slate-500' };

function sameDay(left: Date, right: Date) {
    return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

export function EventCalendar({ events }: { events: ManagedEvent[] }) {
    const [month, setMonth] = useState(() => {
        const firstEvent = events[0] ? new Date(events[0].starts_at) : new Date();
        return new Date(firstEvent.getFullYear(), firstEvent.getMonth(), 1);
    });
    const days = useMemo(() => {
        const first = new Date(month.getFullYear(), month.getMonth(), 1);
        const start = new Date(first);
        start.setDate(first.getDate() - first.getDay());
        return Array.from({ length: 42 }, (_, index) => {
            const day = new Date(start);
            day.setDate(start.getDate() + index);
            return day;
        });
    }, [month]);
    const moveMonth = (amount: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1));

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#091122]">
            <header className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6 dark:border-slate-800">
                <div>
                    <h2 className="font-semibold text-slate-950 dark:text-white">
                        {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                        {events.length} matching {events.length === 1 ? 'event' : 'events'}
                    </p>
                </div>
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => moveMonth(-1)}
                        aria-label="Previous month"
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-white/5 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:text-white"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
                        className="h-9 rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-600 hover:bg-white/5 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:text-white"
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        onClick={() => moveMonth(1)}
                        aria-label="Next month"
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-white/5 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:text-white"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                </div>
            </header>
            <div className="w-full min-w-0">
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#070e1d]">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            className="py-2 text-center text-[10px] font-semibold tracking-wider text-slate-500 uppercase sm:text-xs dark:text-slate-400"
                        >
                            <span className="sm:hidden">{day.charAt(0)}</span>
                            <span className="hidden sm:inline">{day}</span>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {days.map((day) => {
                        const dayEvents = events.filter((event) => sameDay(new Date(event.starts_at), day));
                        const currentMonth = day.getMonth() === month.getMonth();
                        const today = sameDay(day, new Date());
                        return (
                            <div
                                key={day.toISOString()}
                                className="min-h-16 min-w-0 border-r border-b border-slate-200 p-1 sm:min-h-28 sm:p-2 dark:border-slate-800/80"
                            >
                                <span
                                    className={`flex size-6 items-center justify-center rounded-full text-[11px] sm:text-xs ${today ? 'bg-blue-600 font-bold text-white' : currentMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-700'}`}
                                >
                                    {day.getDate()}
                                </span>
                                <div className="mt-1 flex flex-wrap gap-0.5 sm:block sm:space-y-1">
                                    {dayEvents.slice(0, 3).map((event) => (
                                        <div
                                            key={event.id}
                                            title={event.title}
                                            className="flex items-center gap-1 rounded sm:bg-slate-100 sm:px-1.5 sm:py-1 dark:sm:bg-white/[0.04]"
                                        >
                                            <span className={`size-1.5 shrink-0 rounded-full ${statusDot[event.status]}`} />
                                            <span className="hidden truncate text-[11px] text-slate-600 sm:inline dark:text-slate-300">
                                                {event.title}
                                            </span>
                                        </div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <span className="hidden pl-1 text-[9px] text-slate-500 sm:block dark:text-slate-400">
                                            +{dayEvents.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
