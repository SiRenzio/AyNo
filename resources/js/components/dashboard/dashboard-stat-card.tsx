interface DashboardStatCardProps {
    label: string;
    value: number;
    accent: 'blue' | 'amber' | 'green';
}

const accentClasses = {
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    green: 'text-emerald-400',
};

export function DashboardStatCard({ label, value, accent }: DashboardStatCardProps) {
    return (
        <article className="rounded-2xl border border-white/[0.08] bg-[#0d1729] px-5 py-5 shadow-sm sm:px-6">
            <p className={`text-3xl font-bold tracking-tight ${accentClasses[accent]}`}>{value}</p>
            <p className="mt-1.5 text-sm text-slate-500">{label}</p>
        </article>
    );
}
