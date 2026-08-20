import { EventCalendar } from '@/components/events/event-calendar';
import { EventCard } from '@/components/events/event-card';
import { EventToolbar } from '@/components/events/event-toolbar';
import { EventSort, EventStatus, EventView, ManagedEvent } from '@/components/events/event-types';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarX2, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
    events: ManagedEvent[];
}
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Event Management', href: '/events' }];

export default function EventIndex({ events }: Props) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<EventStatus | 'all'>('all');
    const [sort, setSort] = useState<EventSort>('date-asc');
    const [view, setView] = useState<EventView>('list');
    const { props } = usePage<{ flash?: { success?: string } }>();
    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return events
            .filter(
                (event) =>
                    (status === 'all' || event.status === status) &&
                    (!query || `${event.title} ${event.location ?? ''} ${event.notes ?? ''}`.toLowerCase().includes(query)),
            )
            .sort((a, b) => {
                if (sort === 'date-asc') return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
                if (sort === 'date-desc') return new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime();
                return sort === 'title-asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
            });
    }, [events, search, status, sort]);
    const hasFilters = search.trim() !== '' || status !== 'all';
    const statusCounts = {
        all: events.length,
        upcoming: events.filter((event) => event.status === 'upcoming').length,
        overdue: events.filter((event) => event.status === 'overdue').length,
        completed: events.filter((event) => event.status === 'completed').length,
    };
    const managementLabels = [
        { label: 'All Events', count: statusCounts.all, color: 'bg-blue-500' },
        { label: 'Upcoming', count: statusCounts.upcoming, color: 'bg-sky-400' },
        { label: 'Overdue', count: statusCounts.overdue, color: 'bg-amber-400' },
        { label: 'Completed', count: statusCounts.completed, color: 'bg-emerald-400' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} className="bg-slate-50 dark:bg-[#030817]">
            <Head title="Event Management" />
            <main className="flex-1 bg-slate-50 px-4 py-6 pb-28 text-slate-950 sm:px-7 sm:py-8 md:pb-8 lg:px-8 dark:bg-[#050b18] dark:text-white">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-6 flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Event Management</h1>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                Search, organize, and review everything you have planned.
                            </p>
                        </div>
                        <Link
                            href={route('events.create')}
                            className="hidden h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500 sm:flex"
                        >
                            <Plus className="size-4" />
                            Add Event
                        </Link>
                    </header>
                    {props.flash?.success && (
                        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                            {props.flash.success}
                        </div>
                    )}
                    <EventToolbar
                        search={search}
                        status={status}
                        sort={sort}
                        view={view}
                        onSearch={setSearch}
                        onStatus={setStatus}
                        onSort={setSort}
                        onView={setView}
                    />
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-x-5 gap-y-2">
                            {managementLabels.map((item) => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <span className={`h-4 w-1 rounded-full ${item.color}`} />
                                    <span className="text-[11px] font-bold tracking-[0.12em] text-slate-600 uppercase dark:text-slate-300">
                                        {item.label}
                                    </span>
                                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-white/[0.08] dark:text-slate-300">
                                        {item.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('all');
                                }}
                                className="text-xs font-medium text-blue-400 hover:text-blue-300"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                    <div className="mt-4">
                        {filtered.length === 0 ? (
                            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#091122]/60">
                                <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                                    <CalendarX2 className="size-6" />
                                </span>
                                <h2 className="mt-4 font-semibold">{events.length ? 'No matching events' : 'No events yet'}</h2>
                                <p className="mt-1 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    {events.length
                                        ? 'Try changing your search or status filter.'
                                        : 'Create your first event and start keeping track of everything you need.'}
                                </p>
                                {!events.length && (
                                    <Link
                                        href={route('events.create')}
                                        className="mt-5 flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold"
                                    >
                                        <Plus className="size-4" />
                                        Create Event
                                    </Link>
                                )}
                            </div>
                        ) : view === 'calendar' ? (
                            <EventCalendar events={filtered} />
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {filtered.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
