import { useClickOutside } from '@/hooks/use-click-outside';
import { Clock3, Minus, Plus } from 'lucide-react';
import { useRef, useState } from 'react';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

function parseTime(value: string) {
    const [rawHour = '9', rawMinute = '0'] = value.split(':');
    const hour24 = Number(rawHour);
    return {
        hour: String(hour24 % 12 || 12),
        minute: String(Number(rawMinute)).padStart(2, '0'),
        period: hour24 >= 12 ? ('PM' as const) : ('AM' as const),
    };
}

function displayTime(value: string) {
    if (!value) return 'Select time';
    const parsed = parseTime(value);
    return `${parsed.hour}:${parsed.minute} ${parsed.period}`;
}

export function TimePicker({ value, onChange }: Props) {
    const initial = parseTime(value);
    const [open, setOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    useClickOutside(pickerRef, () => setOpen(false), open);
    const [hour, setHour] = useState(initial.hour);
    const [minute, setMinute] = useState(initial.minute);
    const [period, setPeriod] = useState<'AM' | 'PM'>(initial.period);

    const openPicker = () => {
        const current = parseTime(value);
        setHour(current.hour);
        setMinute(current.minute);
        setPeriod(current.period);
        setOpen(!open);
    };
    const save = () => {
        const normalizedHour = Math.min(12, Math.max(1, Number(hour) || 1));
        const normalizedMinute = Math.min(59, Math.max(0, Number(minute) || 0));
        const hour24 = period === 'AM' ? normalizedHour % 12 : (normalizedHour % 12) + 12;
        onChange(`${String(hour24).padStart(2, '0')}:${String(normalizedMinute).padStart(2, '0')}`);
        setOpen(false);
    };

    return (
        <div ref={pickerRef} className="relative min-w-0">
            <button
                type="button"
                aria-label="Choose event time"
                aria-expanded={open}
                onClick={openPicker}
                className="flex h-12 w-full min-w-0 items-center justify-between rounded-xl border border-slate-300 bg-slate-50 px-3 text-left text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#080f20]"
            >
                <span className={value ? 'text-slate-900 dark:text-white' : 'text-slate-500'}>{displayTime(value)}</span>
                <Clock3 className="size-4 shrink-0 text-slate-500" />
            </button>
            {open && (
                <div className="absolute top-full left-0 z-40 mt-2 w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-[#0a1224]">
                    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5">
                        <label className="min-w-0">
                            <span className="mb-1 block text-center text-[9px] font-semibold tracking-wider text-slate-500 uppercase">Hour</span>
                            <div className="relative">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="1"
                                    max="12"
                                    value={hour}
                                    onChange={(event) => setHour(event.target.value)}
                                    className="h-11 w-full min-w-0 appearance-none rounded-lg border border-slate-300 bg-slate-50 pr-16 pl-2 text-left text-base font-semibold outline-none focus:border-blue-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none dark:border-slate-700 dark:bg-[#080f20]"
                                />
                                <div className="absolute top-1/2 right-1 flex -translate-y-1/2 overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
                                    <button type="button" aria-label="Decrease hour" onClick={() => setHour(String(Math.max(1, Number(hour || 1) - 1)))} className="flex size-7 items-center justify-center text-slate-500 transition hover:bg-blue-500/10 hover:text-blue-500 dark:text-slate-400"><Minus className="size-3" /></button>
                                    <button type="button" aria-label="Increase hour" onClick={() => setHour(String(Math.min(12, Number(hour || 0) + 1)))} className="flex size-7 items-center justify-center border-l border-slate-300 text-slate-500 transition hover:bg-blue-500/10 hover:text-blue-500 dark:border-slate-700 dark:text-slate-400"><Plus className="size-3" /></button>
                                </div>
                            </div>
                        </label>
                        <span className="mt-4 font-bold text-slate-400">:</span>
                        <label className="min-w-0">
                            <span className="mb-1 block text-center text-[9px] font-semibold tracking-wider text-slate-500 uppercase">Minute</span>
                            <div className="relative">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    max="59"
                                    value={minute}
                                    onChange={(event) => setMinute(event.target.value)}
                                    className="h-11 w-full min-w-0 appearance-none rounded-lg border border-slate-300 bg-slate-50 pr-16 pl-2 text-left text-base font-semibold outline-none focus:border-blue-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none dark:border-slate-700 dark:bg-[#080f20]"
                                />
                                <div className="absolute top-1/2 right-1 flex -translate-y-1/2 overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
                                    <button type="button" aria-label="Decrease minute" onClick={() => setMinute(String(Math.max(0, Number(minute || 0) - 1)).padStart(2, '0'))} className="flex size-7 items-center justify-center text-slate-500 transition hover:bg-blue-500/10 hover:text-blue-500 dark:text-slate-400"><Minus className="size-3" /></button>
                                    <button type="button" aria-label="Increase minute" onClick={() => setMinute(String(Math.min(59, Number(minute || 0) + 1)).padStart(2, '0'))} className="flex size-7 items-center justify-center border-l border-slate-300 text-slate-500 transition hover:bg-blue-500/10 hover:text-blue-500 dark:border-slate-700 dark:text-slate-400"><Plus className="size-3" /></button>
                                </div>
                            </div>
                        </label>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        {(['AM', 'PM'] as const).map((option) => (
                            <button
                                type="button"
                                key={option}
                                onClick={() => setPeriod(option)}
                                className={`min-h-10 rounded-lg border text-xs font-semibold ${period === option ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setOpen(false);
                            }}
                            className="min-h-10 flex-1 rounded-lg text-xs font-medium text-slate-500"
                        >
                            Clear
                        </button>
                        <button type="button" onClick={save} className="min-h-10 flex-1 rounded-lg bg-blue-600 text-xs font-semibold text-white">
                            Set time
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
