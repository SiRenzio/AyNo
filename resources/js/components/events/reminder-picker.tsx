import { BellRing, Check } from 'lucide-react';

const options = [
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 180, label: '3 hours before' },
    { value: 1440, label: '1 day before' },
    { value: 2880, label: '2 days before' },
    { value: 10080, label: '1 week before' },
];
interface Props {
    selected: number[];
    onChange: (offsets: number[]) => void;
}

export function ReminderPicker({ selected, onChange }: Props) {
    const toggle = (offset: number) => onChange(selected.includes(offset) ? selected.filter((value) => value !== offset) : [...selected, offset]);
    return (
        <div>
            <div className="grid gap-2 sm:grid-cols-2">
                {options.map((option) => {
                    const active = selected.includes(option.value);
                    return (
                        <button
                            type="button"
                            key={option.value}
                            onClick={() => toggle(option.value)}
                            className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 text-left text-sm transition ${active ? 'border-blue-500/60 bg-blue-500/10 text-blue-700 dark:text-white' : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-500 dark:border-slate-700 dark:bg-[#080f20] dark:text-slate-300'}`}
                        >
                            <span
                                className={`flex size-6 items-center justify-center rounded-md ${active ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                            >
                                {active ? <Check className="size-3.5" /> : <BellRing className="size-3.5" />}
                            </span>
                            {option.label}
                        </button>
                    );
                })}
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Reminders will be sent to your account email.</p>
        </div>
    );
}
