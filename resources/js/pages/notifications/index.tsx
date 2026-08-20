import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BellRing, CalendarClock, MapPin, RotateCcw, Trash2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

type Status = 'pending' | 'sent' | 'failed' | 'cancelled';
interface Reminder {
    id: number;
    remind_at: string;
    status: Status;
    channel: string;
    failure_reason: string | null;
    event: { id: number; title: string; location: string | null; starts_at: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Notifications', href: '/notifications' }];
const styles: Record<Status, string> = {
    pending: 'bg-blue-500/10 text-blue-500',
    sent: 'bg-emerald-500/10 text-emerald-500',
    failed: 'bg-red-500/10 text-red-500',
    cancelled: 'bg-slate-500/10 text-slate-500',
};

export default function NotificationIndex({ reminders }: { reminders: Reminder[] }) {
    const [status, setStatus] = useState<Status | 'all'>('all');
    const { props } = usePage<{ flash?: { success?: string } }>();
    const visible = useMemo(() => reminders.filter((reminder) => status === 'all' || reminder.status === status), [reminders, status]);
    const format = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

    return (
        <AppLayout breadcrumbs={breadcrumbs} className="bg-slate-50 dark:bg-[#030817]">
            <Head title="Notifications" />
            <main className="flex-1 bg-slate-50 px-4 py-6 pb-28 text-slate-950 sm:px-7 sm:py-8 dark:bg-[#050b18] dark:text-white">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Review and manage email reminders for your events.</p>
                    {props.flash?.success && <div className="mt-5 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">{props.flash.success}</div>}
                    <div className="mt-6 grid grid-cols-2 gap-2 min-[430px]:grid-cols-3 sm:flex sm:flex-wrap">
                        {(['all', 'pending', 'sent', 'failed', 'cancelled'] as const).map((item) => (
                            <button key={item} onClick={() => setStatus(item)} className={`min-h-10 rounded-xl px-3 py-2 text-xs font-semibold capitalize sm:min-h-0 sm:rounded-full sm:px-4 ${status === item ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10'}`}>
                                {item} ({item === 'all' ? reminders.length : reminders.filter((r) => r.status === item).length})
                            </button>
                        ))}
                    </div>
                    <div className="mt-5 space-y-3">
                        {visible.map((reminder) => (
                            <article key={reminder.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#091122]">
                                <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 sm:size-11"><BellRing className="size-5" /></span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                                            <Link href={route('events.show', reminder.event.id)} className="max-w-full break-words font-semibold leading-snug hover:text-blue-500">{reminder.event.title}</Link>
                                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${styles[reminder.status]}`}>{reminder.status}</span>
                                        </div>
                                        <div className="mt-3 space-y-1.5">
                                            <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"><CalendarClock className="mt-0.5 size-4 shrink-0" /><span>Reminder: {format(reminder.remind_at)}</span></p>
                                            <p className="pl-6 text-xs text-slate-500">Event: {format(reminder.event.starts_at)}</p>
                                            {reminder.event.location && <p className="flex items-start gap-2 text-xs text-slate-500"><MapPin className="size-3.5 shrink-0" /><span className="break-words">{reminder.event.location}</span></p>}
                                        </div>
                                        {reminder.failure_reason && <p className="mt-2 text-xs text-red-500">{reminder.failure_reason}</p>}
                                    </div>
                                </div>
                                {reminder.status !== 'sent' && <div className="flex border-t border-slate-200 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.02]">
                                    {(reminder.status === 'failed' || reminder.status === 'cancelled') && <button title="Retry reminder" onClick={() => router.patch(route('reminders.update', reminder.id), { status: 'pending' }, { preserveScroll: true })} className="flex min-h-11 flex-1 items-center justify-center gap-2 px-3 text-xs font-medium text-slate-600 transition hover:bg-blue-500/10 hover:text-blue-500 dark:text-slate-300"><RotateCcw className="size-4" />Retry</button>}
                                    {reminder.status === 'pending' && <button title="Cancel reminder" onClick={() => router.patch(route('reminders.update', reminder.id), { status: 'cancelled' }, { preserveScroll: true })} className="flex min-h-11 flex-1 items-center justify-center gap-2 px-3 text-xs font-medium text-slate-600 transition hover:bg-amber-500/10 hover:text-amber-500 dark:text-slate-300"><XCircle className="size-4" />Cancel</button>}
                                    <button title="Delete reminder" onClick={() => router.delete(route('reminders.destroy', reminder.id), { preserveScroll: true })} className="flex min-h-11 flex-1 items-center justify-center gap-2 border-l border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-red-500/10 hover:text-red-500 dark:border-white/10 dark:text-slate-300"><Trash2 className="size-4" />Delete</button>
                                </div>}
                            </article>
                        ))}
                        {!visible.length && <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700"><BellRing className="mx-auto size-8 text-slate-400" /><p className="mt-3 text-sm text-slate-500">No {status === 'all' ? '' : status} reminders found.</p></div>}
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
