import { GripVertical, Plus, Trash2 } from 'lucide-react';

interface Props {
    items: string[];
    onChange: (items: string[]) => void;
}

export function ChecklistBuilder({ items, onChange }: Props) {
    const update = (index: number, value: string) => onChange(items.map((item, itemIndex) => (itemIndex === index ? value : item)));
    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <GripVertical className="hidden size-4 shrink-0 text-slate-700 sm:block" />
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-slate-300 text-[11px] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        {index + 1}
                    </span>
                    <input
                        value={item}
                        onChange={(event) => update(index, event.target.value)}
                        placeholder="What do you need to bring or do?"
                        className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-500 focus:border-blue-500 dark:border-slate-700 dark:bg-[#080f20] dark:text-slate-400 dark:text-white"
                    />
                    <button
                        type="button"
                        onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                        aria-label={`Remove checklist item ${index + 1}`}
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 dark:text-slate-400"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={() => onChange([...items, ''])}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-sm font-medium text-blue-400 transition hover:border-blue-500/60 hover:bg-blue-500/5 dark:border-slate-700"
            >
                <Plus className="size-4" /> Add checklist item
            </button>
        </div>
    );
}
