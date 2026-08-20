import { DatePicker } from '@/components/events/date-picker';
import { TimePicker } from '@/components/events/time-picker';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarDays, FileText, MapPin, Save } from 'lucide-react';
import { FormEvent } from 'react';

interface EventDetails { id: number; title: string; location: string | null; notes: string | null; starts_at: string; status: string }

export default function EditEvent({ event }: { event: EventDetails }) {
    const form = useForm({ title: event.title, location: event.location ?? '', notes: event.notes ?? '', starts_at: event.starts_at });
    const [date = '', time = ''] = form.data.starts_at.split('T');
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Event Management', href: '/events' },
        { title: event.title, href: `/events/${event.id}` },
        { title: 'Edit', href: `/events/${event.id}/edit` },
    ];
    const submit = (submitEvent: FormEvent) => {
        submitEvent.preventDefault();
        form.patch(route('events.update', event.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} className="bg-slate-50 dark:bg-[#030817]">
            <Head title={`Edit ${event.title}`} />
            <main className="flex-1 bg-slate-50 px-4 py-6 pb-28 text-slate-950 sm:px-7 sm:py-8 dark:bg-[#050b18] dark:text-white">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit event</h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Update the event schedule and details.</p>
                    <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-[#091122]">
                        <label className="block">
                            <span className="mb-2 block text-xs font-semibold tracking-wider uppercase">Event name</span>
                            <input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#080f20]" />
                            {form.errors.title && <p className="mt-1 text-xs text-red-400">{form.errors.title}</p>}
                        </label>
                        <div>
                            <span className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase"><CalendarDays className="size-4" />Date and time</span>
                            <div className="grid gap-2 min-[420px]:grid-cols-2"><DatePicker value={date} onChange={(value) => form.setData('starts_at', `${value}T${time}`)} /><TimePicker value={time} onChange={(value) => form.setData('starts_at', `${date}T${value}`)} /></div>
                            {form.errors.starts_at && <p className="mt-1 text-xs text-red-400">{form.errors.starts_at}</p>}
                        </div>
                        <label className="block">
                            <span className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase"><MapPin className="size-4" />Location</span>
                            <input value={form.data.location} onChange={(e) => form.setData('location', e.target.value)} className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#080f20]" />
                            {form.errors.location && <p className="mt-1 text-xs text-red-400">{form.errors.location}</p>}
                        </label>
                        <label className="block">
                            <span className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase"><FileText className="size-4" />Notes</span>
                            <textarea rows={4} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#080f20]" />
                            {form.errors.notes && <p className="mt-1 text-xs text-red-400">{form.errors.notes}</p>}
                        </label>
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
                            <Link href={route('events.show', event.id)} className="flex h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-semibold dark:border-slate-700">Cancel</Link>
                            <button disabled={form.processing} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white disabled:opacity-50"><Save className="size-4" />{form.processing ? 'Saving...' : 'Save changes'}</button>
                        </div>
                    </form>
                </div>
            </main>
        </AppLayout>
    );
}
