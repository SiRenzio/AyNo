import { useClickOutside } from '@/hooks/use-click-outside';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

interface Props {
    value: string;
    onChange: (value: string) => void;
}
const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const toValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const fromValue = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return year && month && day ? new Date(year, month - 1, day) : null;
};

export function DatePicker({ value, onChange }: Props) {
    const selected = fromValue(value);
    const [open, setOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    useClickOutside(pickerRef, () => setOpen(false), open);
    const [month, setMonth] = useState(() => {
        const date = selected ?? new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    });
    const days = useMemo(() => {
        const first = new Date(month.getFullYear(), month.getMonth(), 1);
        const start = new Date(first);
        start.setDate(first.getDate() - first.getDay());
        return Array.from({ length: 42 }, (_, index) => {
            const date = new Date(start);
            date.setDate(start.getDate() + index);
            return date;
        });
    }, [month]);
    const move = (amount: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div ref={pickerRef} className="relative min-w-0">
            <button
                type="button"
                aria-label="Choose event date"
                aria-expanded={open}
                onClick={() => setOpen(!open)}
                className="flex h-12 w-full min-w-0 items-center justify-between rounded-xl border border-slate-300 bg-slate-50 px-3 text-left text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#080f20]"
            >
                <span className={selected ? 'truncate text-slate-900 dark:text-white' : 'text-slate-500'}>
                    {selected ? selected.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}
                </span>
                <CalendarDays className="size-4 shrink-0 text-slate-500" />
            </button>
            {open && (
                <div className="absolute top-full left-0 z-40 mt-2 w-full min-w-0 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-[#0a1224]">
                    <div className="flex items-center justify-between gap-1 pb-2">
                        <button
                            type="button"
                            onClick={() => move(-1)}
                            aria-label="Previous month"
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                            {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                            type="button"
                            onClick={() => move(1)}
                            aria-label="Next month"
                            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7">
                        {weekDays.map((day, index) => (
                            <span key={`${day}-${index}`} className="py-1 text-center text-[10px] font-semibold text-slate-500">
                                {day}
                            </span>
                        ))}
                        {days.map((date) => {
                            const active = value === toValue(date);
                            const current = date.getMonth() === month.getMonth();
                            const isPast = date < today;
                            return (
                                <button
                                    type="button"
                                    key={toValue(date)}
                                    disabled={isPast}
                                    onClick={() => {
                                        onChange(toValue(date));
                                        setOpen(false);
                                    }}
                                    className={`aspect-square min-h-7 min-w-0 rounded-md text-[10px] font-medium transition sm:text-xs ${isPast ? 'cursor-not-allowed text-slate-300 opacity-40 dark:text-slate-700' : active ? 'bg-blue-600 text-white' : current ? 'text-slate-700 hover:bg-blue-500/10 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'}`}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-1 flex justify-between border-t border-slate-200 pt-2 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setOpen(false);
                            }}
                            className="min-h-9 px-2 text-xs font-medium text-slate-500"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                onChange(toValue(today));
                                setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                                setOpen(false);
                            }}
                            className="min-h-9 px-2 text-xs font-medium text-blue-600 dark:text-blue-400"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
