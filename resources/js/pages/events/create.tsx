import { ChecklistBuilder } from '@/components/events/checklist-builder';
import { DatePicker } from '@/components/events/date-picker';
import { ReminderPicker } from '@/components/events/reminder-picker';
import { EventTemplate, TemplatePicker } from '@/components/events/template-picker';
import { TimePicker } from '@/components/events/time-picker';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { BellRing, CalendarDays, CheckSquare2, FileText, MapPin, Sparkles } from 'lucide-react';
import { FormEvent } from 'react';

interface Props {
    templates: EventTemplate[];
}
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Add New Event', href: '/events/create' }];

function Section({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: typeof CalendarDays;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-[#091122]">
            <div className="mb-5 flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Icon className="size-5" />
                </span>
                <div>
                    <h2 className="font-semibold text-slate-950 dark:text-white">{title}</h2>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{description}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

function FieldError({ message }: { message?: string }) {
    return message ? <p className="mt-1.5 text-xs text-red-400">{message}</p> : null;
}

export default function CreateEvent({ templates }: Props) {
    const form = useForm({
        title: '',
        location: '',
        starts_at: '',
        notes: '',
        template_id: null as number | null,
        checklist_items: [''],
        reminder_offsets: [1440] as number[],
    });
    const [eventDate = '', eventTime = ''] = form.data.starts_at.split('T');
    const updateStart = (date: string, time: string) => form.setData('starts_at', `${date}T${time}`);
    const selectedSchedule = eventDate && eventTime ? new Date(form.data.starts_at) : null;
    const scheduleIsPast = selectedSchedule !== null && !Number.isNaN(selectedSchedule.getTime()) && selectedSchedule <= new Date();
    const applyTemplate = (template: EventTemplate | null) => {
        form.setData((data) => ({
            ...data,
            template_id: template?.id ?? null,
            checklist_items: template ? [...template.items] : data.checklist_items,
        }));
    };
    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (scheduleIsPast) {
            form.setError('starts_at', 'Choose a date and time in the future.');
            return;
        }
        form.transform((data) => ({
            ...data,
            checklist_items: data.checklist_items.map((item) => item.trim()).filter(Boolean),
        }));
        form.post(route('events.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} className="bg-slate-50 dark:bg-[#030817]">
            <Head title="Add New Event" />
            <main className="flex-1 bg-slate-50 px-4 py-6 pb-28 text-slate-950 sm:px-7 sm:py-8 md:pb-8 lg:px-8 dark:bg-[#050b18] dark:text-white">
                <div className="mx-auto max-w-5xl">
                    <header className="mb-7">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create a new event</h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Plan ahead so nothing important gets left behind.</p>
                    </header>
                    <form onSubmit={submit} className="space-y-5">
                        <Section icon={Sparkles} title="Optional template" description="Quickly fill your checklist using a saved template.">
                            <TemplatePicker templates={templates} selectedId={form.data.template_id} onSelect={applyTemplate} />
                            {templates.length === 0 && (
                                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                                    No templates are available yet. You can still build your checklist manually.
                                </p>
                            )}
                        </Section>

                        <Section icon={CalendarDays} title="Event details" description="Tell us where and when you need to be.">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="sm:col-span-2">
                                    <span className="mb-2 block text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                                        Event name <span className="text-red-400">*</span>
                                    </span>
                                    <input
                                        value={form.data.title}
                                        onChange={(e) => form.setData('title', e.target.value)}
                                        placeholder="e.g. Claim my diploma"
                                        className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-blue-500 dark:border-slate-700 dark:bg-[#080f20] dark:text-slate-400"
                                    />
                                    <FieldError message={form.errors.title} />
                                </label>
                                <div className="min-w-0">
                                    <span className="mb-2 block text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                                        Date and time <span className="text-red-400">*</span>
                                    </span>
                                    <div className="grid min-w-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-1 lg:grid-cols-2">
                                        <DatePicker value={eventDate} onChange={(date) => updateStart(date, eventTime)} />
                                        <TimePicker value={eventTime} onChange={(time) => updateStart(eventDate, time)} />
                                    </div>
                                    <FieldError message={scheduleIsPast ? 'Choose a date and time in the future.' : form.errors.starts_at} />
                                </div>
                                <label>
                                    <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                                        <MapPin className="size-3.5" /> Location
                                    </span>
                                    <input
                                        value={form.data.location}
                                        onChange={(e) => form.setData('location', e.target.value)}
                                        placeholder="Building, room, or address"
                                        className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-blue-500 dark:border-slate-700 dark:bg-[#080f20] dark:text-slate-400"
                                    />
                                    <FieldError message={form.errors.location} />
                                </label>
                                <label className="sm:col-span-2">
                                    <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                                        <FileText className="size-3.5" /> Notes
                                    </span>
                                    <textarea
                                        value={form.data.notes}
                                        onChange={(e) => form.setData('notes', e.target.value)}
                                        rows={3}
                                        placeholder="Add useful instructions or details..."
                                        className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-blue-500 dark:border-slate-700 dark:bg-[#080f20] dark:text-slate-400"
                                    />
                                    <FieldError message={form.errors.notes} />
                                </label>
                            </div>
                        </Section>

                        <Section icon={CheckSquare2} title="Checklist" description="List everything you need to bring, prepare, or complete.">
                            <ChecklistBuilder items={form.data.checklist_items} onChange={(items) => form.setData('checklist_items', items)} />
                            <FieldError message={form.errors.checklist_items} />
                        </Section>

                        <Section icon={BellRing} title="Reminders" description="Choose when you want us to remind you before the event.">
                            <ReminderPicker selected={form.data.reminder_offsets} onChange={(offsets) => form.setData('reminder_offsets', offsets)} />
                            <FieldError message={form.errors.reminder_offsets} />
                        </Section>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
                            <Link
                                href={route('dashboard')}
                                className="flex h-12 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-white/5"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={form.processing || scheduleIsPast}
                                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:opacity-60"
                            >
                                <CalendarDays className="size-4" />
                                {form.processing ? 'Creating event...' : 'Create Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </AppLayout>
    );
}
