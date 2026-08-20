import { CheckCircle2 } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <CheckCircle2 className="size-5" strokeWidth={2.4} />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold tracking-tight">AyNo</span>
                <span className="text-sidebar-foreground/45 truncate text-[10px] font-medium">Personal Reminder</span>
            </div>
        </>
    );
}
