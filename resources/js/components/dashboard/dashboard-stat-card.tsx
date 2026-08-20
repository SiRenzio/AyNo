interface DashboardStatCardProps {
    label: string;
    value: number;
    accent: 'blue' | 'amber' | 'green';
}

const accentClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
    green: 'text-emerald-600 dark:text-emerald-400',
};

export function DashboardStatCard({ label, value, accent }: DashboardStatCardProps) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:rounded-2xl sm:px-6 sm:py-5 dark:border-white/[0.08] dark:bg-[#0d1729]">
            <p className={`text-2xl font-bold tracking-tight sm:text-3xl ${accentClasses[accent]}`}>{value}</p>
            <p className="mt-1 text-xs text-slate-600 sm:mt-1.5 sm:text-sm dark:text-slate-300">{label}</p>
        </article>
    );
}
