import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface EventTemplate {
    id: number;
    name: string;
    description: string | null;
    items: string[];
}

interface Props {
    templates: EventTemplate[];
    selectedId: number | null;
    onSelect: (template: EventTemplate | null) => void;
}

export function TemplatePicker({ templates, selectedId, onSelect }: Props) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const selected = templates.find((template) => template.id === selectedId);
    const filtered = useMemo(
        () => templates.filter((template) => `${template.name} ${template.description ?? ''}`.toLowerCase().includes(search.toLowerCase())),
        [search, templates],
    );

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex min-h-12 w-full items-center justify-between rounded-xl border border-slate-300 bg-slate-50 px-4 text-left text-sm transition hover:border-slate-600 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-[#080f20]"
            >
                <span className={selected ? 'text-slate-950 dark:text-white' : 'text-slate-600 dark:text-slate-300'}>
                    {selected?.name ?? 'Start without a template'}
                </span>
                <span className="flex items-center gap-2">
                    {selected && (
                        <span
                            role="button"
                            tabIndex={0}
                            aria-label="Clear template"
                            onClick={(event) => {
                                event.stopPropagation();
                                onSelect(null);
                            }}
                            onKeyDown={(event) => event.key === 'Enter' && onSelect(null)}
                            className="rounded p-1 text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:text-white"
                        >
                            <X className="size-4" />
                        </span>
                    )}
                    <ChevronDown className={`size-4 text-slate-600 transition dark:text-slate-300 ${open ? 'rotate-180' : ''}`} />
                </span>
            </button>
            {open && (
                <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#0a1224]">
                    <div className="border-b border-slate-200 p-3 dark:border-slate-800">
                        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 dark:bg-[#050b18]">
                            <Search className="size-4 text-slate-600 dark:text-slate-300" />
                            <input
                                autoFocus
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search templates..."
                                className="h-10 w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-500 dark:text-slate-400 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                onSelect(null);
                                setOpen(false);
                            }}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-white/5"
                        >
                            <span className="text-sm text-slate-700 dark:text-slate-200">No template</span>
                            {!selected && <Check className="size-4 text-blue-400" />}
                        </button>
                        {filtered.map((template) => (
                            <button
                                type="button"
                                key={template.id}
                                onClick={() => {
                                    onSelect(template);
                                    setOpen(false);
                                    setSearch('');
                                }}
                                className="flex w-full items-start justify-between rounded-lg px-3 py-2.5 text-left hover:bg-white/5"
                            >
                                <span>
                                    <span className="block text-sm font-medium text-slate-950 dark:text-white">{template.name}</span>
                                    <span className="mt-0.5 block text-xs text-slate-600 dark:text-slate-300">
                                        {template.description ?? `${template.items.length} checklist items`}
                                    </span>
                                </span>
                                {selectedId === template.id && <Check className="mt-0.5 size-4 text-blue-400" />}
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <p className="px-3 py-5 text-center text-sm text-slate-600 dark:text-slate-300">No templates found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
