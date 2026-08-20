import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Bell, CalendarClock, Check, ChevronLeft, Clock3, MapPin, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface ChecklistItem {
    id: number;
    description: string;
    is_completed: boolean;
}
interface EventReminder {
    id: number;
    offset_minutes: number | null;
    remind_at: string;
    status: string;
}
interface EventDetails {
    id: number;
    title: string;
    location: string | null;
    notes: string | null;
    starts_at: string;
    status: string;
    checklist_items: ChecklistItem[];
    reminders: EventReminder[];
}
interface Props {
    event: EventDetails;
}

const dateTime = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const quickReminders = [
    { label: '1 day before', value: 1440 },
    { label: '2 hours before', value: 120 },
    { label: '1 hour before', value: 60 },
    { label: '30 min before', value: 30 },
];

function reminderLabel(minutes: number | null) {
    if (minutes === null) return 'Custom reminder';
    if (minutes >= 10080 && minutes % 10080 === 0) return `${minutes / 10080} ${minutes === 10080 ? 'week' : 'weeks'} before`;
    if (minutes >= 1440 && minutes % 1440 === 0) return `${minutes / 1440} ${minutes === 1440 ? 'day' : 'days'} before`;
    if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60} ${minutes === 60 ? 'hour' : 'hours'} before`;
    return `${minutes} minutes before`;
}

export default function EventShow({ event }: Props) {
    const completed = event.checklist_items.filter((item) => item.is_completed).length;
    const progress = event.checklist_items.length ? Math.round((completed / event.checklist_items.length) * 100) : 0;
    const checklistForm = useForm({ description: '' });
    const [customReminder, setCustomReminder] = useState('');
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Event Management', href: '/events' },
        { title: event.title, href: `/events/${event.id}` },
    ];

    const addChecklistItem = (submitEvent: FormEvent) => {
        submitEvent.preventDefault();
        checklistForm.post(route('checklist-items.store', event.id), { preserveScroll: true, onSuccess: () => checklistForm.reset() });
    };
    const addReminder = (offset: number) => {
        router.post(route('reminders.store', event.id), { offset_minutes: offset }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} className="bg-slate-50 dark:bg-[#030817]">
            <Head title={event.title} />
            <main className="flex-1 bg-slate-50 px-4 py-6 pb-28 text-slate-950 sm:px-7 sm:py-8 md:pb-8 lg:px-8 dark:bg-[#050b18] dark:text-white">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href={route('events.index')}
                        className="mb-5 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:text-white"
                    >
                        <ChevronLeft className="size-4" />
                        Back to events
                    </Link>
                    <header className="mb-6 flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <span
                                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${event.status === 'overdue' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : event.status === 'completed' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-blue-500/30 bg-blue-500/10 text-blue-400'}`}
                                >
                                    {event.status}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{event.title}</h1>
                        </div>
                    </header>

                    <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 sm:p-6 dark:border-slate-800 dark:bg-[#091122]">
                        <div>
                            <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                                Date &amp; time
                            </p>
                            <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
                                <CalendarClock className="size-4 text-slate-600 dark:text-slate-300" />
                                {dateTime.format(new Date(event.starts_at))}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">Location</p>
                            <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
                                <MapPin className="size-4 text-slate-600 dark:text-slate-300" />
                                {event.location ?? 'No location provided'}
                            </p>
                        </div>
                        {event.notes && (
                            <div className="sm:col-span-2">
                                <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">Notes</p>
                                <p className="mt-2 text-sm leading-6 text-blue-200/80">{event.notes}</p>
                            </div>
                        )}
                    </section>

                    <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#091122]">
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold">Checklist</h2>
                                <span className="text-xs text-slate-600 dark:text-slate-300">
                                    {completed} of {event.checklist_items.length} prepared
                                </span>
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-xs text-slate-600 dark:text-slate-300">{progress}%</span>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                            {event.checklist_items.length ? (
                                event.checklist_items.map((item) => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() =>
                                            router.patch(
                                                route('checklist-items.update', item.id),
                                                { is_completed: !item.is_completed },
                                                { preserveScroll: true },
                                            )
                                        }
                                        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.025] sm:px-6"
                                    >
                                        <span
                                            className={`flex size-4 shrink-0 items-center justify-center rounded border ${item.is_completed ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-600'}`}
                                        >
                                            {item.is_completed && <Check className="size-3" />}
                                        </span>
                                        <span
                                            className={`text-sm ${item.is_completed ? 'text-slate-500 line-through dark:text-slate-400' : 'text-slate-200'}`}
                                        >
                                            {item.description}
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <p className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">No checklist items yet.</p>
                            )}
                        </div>
                        <form onSubmit={addChecklistItem} className="flex gap-2 p-4 sm:p-6">
                            <input
                                value={checklistForm.data.description}
                                onChange={(e) => checklistForm.setData('description', e.target.value)}
                                placeholder="Add checklist item..."
                                className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm outline-none placeholder:text-slate-500 focus:border-blue-500 dark:border-slate-700 dark:bg-[#080f20] dark:text-slate-400"
                            />
                            <button
                                disabled={checklistForm.processing}
                                className="flex h-11 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
                            >
                                <Plus className="size-4" />
                                <span className="hidden sm:inline">Add</span>
                            </button>
                        </form>
                    </section>

                    <section className="mt-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#091122]">
                        <div className="p-4 sm:p-6">
                            <h2 className="font-semibold">Reminders</h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Email reminders for this event</p>
                        </div>
                        <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                            {event.reminders.length ? (
                                event.reminders.map((reminder) => (
                                    <div key={reminder.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
                                        <Bell className="size-4 shrink-0 text-slate-600 dark:text-slate-300" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-blue-200">{reminderLabel(reminder.offset_minutes)}</p>
                                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                {dateTime.format(new Date(reminder.remind_at))}
                                            </p>
                                        </div>
                                        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400">
                                            {reminder.status}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => router.delete(route('reminders.destroy', reminder.id), { preserveScroll: true })}
                                            aria-label="Remove reminder"
                                            className="p-1.5 text-slate-500 hover:text-red-400 dark:text-slate-400"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">No reminders scheduled.</p>
                            )}
                        </div>
                        <div className="p-4 sm:p-6">
                            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Add reminder</p>
                            <div className="flex flex-wrap gap-2">
                                {quickReminders.map((option) => (
                                    <button
                                        type="button"
                                        key={option.value}
                                        onClick={() => addReminder(option.value)}
                                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-blue-200 transition hover:border-blue-500/50 hover:bg-blue-500/10 dark:border-slate-700"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3 flex max-w-sm gap-2">
                                <div className="relative flex-1">
                                    <Clock3 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                                    <input
                                        type="number"
                                        min="1"
                                        value={customReminder}
                                        onChange={(e) => setCustomReminder(e.target.value)}
                                        placeholder="Custom minutes before"
                                        className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pr-3 pl-9 text-xs outline-none placeholder:text-slate-500 focus:border-blue-500 dark:border-slate-700 dark:bg-[#080f20] dark:text-slate-400"
                                    />
                                </div>
                                <button
                                    type="button"
                                    disabled={!customReminder || Number(customReminder) < 1}
                                    onClick={() => {
                                        addReminder(Number(customReminder));
                                        setCustomReminder('');
                                    }}
                                    className="rounded-lg border border-blue-500/40 px-3 text-xs font-medium text-blue-400 disabled:opacity-40"
                                >
                                    + Add
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </AppLayout>
    );
}
