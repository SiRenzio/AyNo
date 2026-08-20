import { CalendarDays, Check, ChevronDown, List, Search } from 'lucide-react';
import { useState } from 'react';
import { EventSort, EventStatus, EventView } from './event-types';

interface Props {
    search: string;
    status: EventStatus | 'all';
    sort: EventSort;
    view: EventView;
    onSearch: (value: string) => void;
    onStatus: (value: EventStatus | 'all') => void;
    onSort: (value: EventSort) => void;
    onView: (value: EventView) => void;
}
interface MenuOption {
    value: string;
    label: string;
}

const statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];
const sortOptions = [
    { value: 'date-asc', label: 'Date: earliest' },
    { value: 'date-desc', label: 'Date: latest' },
    { value: 'title-asc', label: 'Name: A-Z' },
    { value: 'title-desc', label: 'Name: Z-A' },
];
const controlClass =
    'h-11 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-[#080f20] dark:text-slate-200';

function ToolbarMenu({
    value,
    options,
    onChange,
    label,
}: {
    value: string;
    options: MenuOption[];
    onChange: (value: string) => void;
    label: string;
}) {
    const [open, setOpen] = useState(false);
    const selected = options.find((option) => option.value === value) ?? options[0];
    return (
        <div className="relative min-w-0 flex-1 sm:w-44 sm:flex-none">
            <button
                type="button"
                aria-label={label}
                aria-expanded={open}
                onClick={() => setOpen(!open)}
                className={`${controlClass} flex w-full items-center justify-between gap-2 px-3 text-left`}
            >
                <span className="truncate">{selected.label}</span>
                <ChevronDown className={`size-4 shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute top-full right-0 left-0 z-40 mt-2 min-w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl sm:min-w-48 dark:border-slate-700 dark:bg-[#0a1224]">
                    {options.map((option) => (
                        <button
                            type="button"
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                            className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm ${option.value === value ? 'bg-blue-500/10 font-medium text-blue-600 dark:text-blue-300' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5'}`}
                        >
                            <span>{option.label}</span>
                            {option.value === value && <Check className="size-4 shrink-0" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function EventToolbar({ search, status, sort, view, onSearch, onStatus, onSort, onView }: Props) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 dark:border-slate-800 dark:bg-[#091122]">
            <div className="flex flex-col gap-3 xl:flex-row">
                <label className="relative min-w-0 flex-1">
                    <span className="sr-only">Search events</span>
                    <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={(event) => onSearch(event.target.value)}
                        placeholder="Search events, locations, or notes..."
                        className={`${controlClass} w-full pr-4 pl-10 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                    />
                </label>
                <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:gap-3">
                    <ToolbarMenu
                        label="Filter event status"
                        value={status}
                        options={statusOptions}
                        onChange={(value) => onStatus(value as EventStatus | 'all')}
                    />
                    <ToolbarMenu label="Sort events" value={sort} options={sortOptions} onChange={(value) => onSort(value as EventSort)} />
                </div>
                <div className="grid h-11 grid-cols-2 rounded-xl border border-slate-300 bg-white p-1 sm:w-28 dark:border-slate-700 dark:bg-[#080f20]">
                    <button
                        type="button"
                        onClick={() => onView('list')}
                        aria-label="List view"
                        className={`flex items-center justify-center rounded-lg transition ${view === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white'}`}
                    >
                        <List className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onView('calendar')}
                        aria-label="Calendar view"
                        className={`flex items-center justify-center rounded-lg transition ${view === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white'}`}
                    >
                        <CalendarDays className="size-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
