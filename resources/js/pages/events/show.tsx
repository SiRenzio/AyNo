import AppLayout from '@/layouts/app-layout';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertTriangle, Bell, CalendarClock, Check, CheckCircle2, ChevronLeft, Clock3, MapPin, Minus, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
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
    const [pendingAction, setPendingAction] = useState<'complete' | 'cancel' | 'delete' | null>(null);
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
    const confirmation = pendingAction === 'complete'
        ? { title: 'Complete this event?', description: 'The event will be marked complete and all pending reminders will be cancelled.', label: 'Complete event', tone: 'bg-emerald-600 hover:bg-emerald-500', icon: CheckCircle2 }
        : pendingAction === 'cancel'
          ? { title: 'Cancel this event?', description: 'The event will be cancelled and no pending reminders will be delivered.', label: 'Cancel event', tone: 'bg-amber-500 hover:bg-amber-400', icon: XCircle }
          : { title: 'Permanently delete event?', description: 'The event, checklist items, and reminders will be permanently deleted. This cannot be undone.', label: 'Delete permanently', tone: 'bg-red-600 hover:bg-red-500', icon: Trash2 };
    const confirmAction = () => {
        if (pendingAction === 'delete') router.delete(route('events.destroy', event.id));
        if (pendingAction === 'complete') router.patch(route('events.status.update', event.id), { status: 'completed' });
        if (pendingAction === 'cancel') router.patch(route('events.status.update', event.id), { status: 'cancelled' });
        setPendingAction(null);
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
                    <header className="relative mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
                        <div className="min-w-0 pr-24 sm:pr-0">
                            <div className="mb-2 flex items-center gap-2">
                                <span
                                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${event.status === 'overdue' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : event.status === 'completed' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : event.status === 'cancelled' ? 'border-slate-500/30 bg-slate-500/10 text-slate-400' : 'border-blue-500/30 bg-blue-500/10 text-blue-400'}`}
                                >
                                    {event.status}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{event.title}</h1>
                        </div>
                        <div className="absolute top-0 right-0 flex gap-2 sm:hidden">
                            {!['completed', 'cancelled'].includes(event.status) && (
                                <Link href={route('events.edit', event.id)} aria-label="Edit event" title="Edit event" className="flex size-10 items-center justify-center rounded-xl border border-slate-300 text-slate-600 transition hover:border-blue-500/50 hover:text-blue-500 dark:border-slate-700 dark:text-slate-300"><Pencil className="size-4" /></Link>
                            )}
                            <button onClick={() => setPendingAction('delete')} aria-label="Delete event" title="Delete event" className="flex size-10 items-center justify-center rounded-xl border border-red-500/40 text-red-500 transition hover:bg-red-500/10"><Trash2 className="size-4" /></button>
                        </div>
                        {!['completed', 'cancelled'].includes(event.status) && (
                            <div className="flex w-full gap-2 sm:hidden">
                                <button onClick={() => setPendingAction('complete')} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white"><CheckCircle2 className="size-4" />Complete</button>
                                <button onClick={() => setPendingAction('cancel')} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-amber-500/40 px-3 text-xs font-semibold text-amber-500"><XCircle className="size-4" />Cancel</button>
                            </div>
                        )}
                        <div className="hidden flex-wrap gap-2 sm:flex sm:w-auto sm:justify-end">
                            {!['completed', 'cancelled'].includes(event.status) && <>
                                <Link href={route('events.edit', event.id)} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 text-xs font-semibold sm:flex-none dark:border-slate-700"><Pencil className="size-4" />Edit</Link>
                                <button onClick={() => setPendingAction('complete')} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white sm:flex-none"><CheckCircle2 className="size-4" />Complete</button>
                                <button onClick={() => setPendingAction('cancel')} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-amber-500/40 px-3 text-xs font-semibold text-amber-500 sm:flex-none"><XCircle className="size-4" />Cancel</button>
                            </>}
                            <button onClick={() => setPendingAction('delete')} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/40 px-3 text-xs font-semibold text-red-500 sm:flex-none"><Trash2 className="size-4" />Delete</button>
                        </div>
                    </header>

                    <Dialog open={pendingAction !== null} onOpenChange={(open) => !open && setPendingAction(null)}>
                        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl border-slate-200 bg-white p-0 text-slate-950 shadow-2xl dark:border-slate-700 dark:bg-[#091122] dark:text-white">
                            <div className="p-6">
                                <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                                    <AlertTriangle className="size-5" />
                                </span>
                                <DialogTitle className="text-xl">{confirmation.title}</DialogTitle>
                                <DialogDescription className="mt-2 leading-6 text-slate-600 dark:text-slate-300">{confirmation.description}</DialogDescription>
                            </div>
                            <DialogFooter className="gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:space-x-0 dark:border-slate-800 dark:bg-white/[0.02]">
                                <DialogClose asChild>
                                    <button className="h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-white/5">Keep event</button>
                                </DialogClose>
                                <button onClick={confirmAction} className={`flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition ${confirmation.tone}`}>
                                    <confirmation.icon className="size-4" />
                                    {confirmation.label}
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

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
                                        className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 pr-20 pl-9 text-xs outline-none placeholder:text-slate-500 focus:border-blue-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none dark:border-slate-700 dark:bg-[#080f20] dark:text-slate-400"
                                    />
                                    <div className="absolute top-1/2 right-1 flex -translate-y-1/2 overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
                                        <button
                                            type="button"
                                            aria-label="Decrease reminder minutes"
                                            onClick={() => setCustomReminder(String(Math.max(1, Number(customReminder || 1) - 1)))}
                                            className="flex size-7 items-center justify-center text-slate-500 transition hover:bg-blue-500/10 hover:text-blue-500 dark:text-slate-400"
                                        >
                                            <Minus className="size-3" />
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="Increase reminder minutes"
                                            onClick={() => setCustomReminder(String(Number(customReminder || 0) + 1))}
                                            className="flex size-7 items-center justify-center border-l border-slate-300 text-slate-500 transition hover:bg-blue-500/10 hover:text-blue-500 dark:border-slate-700 dark:text-slate-400"
                                        >
                                            <Plus className="size-3" />
                                        </button>
                                    </div>
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
