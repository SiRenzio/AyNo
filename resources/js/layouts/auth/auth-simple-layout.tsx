import { Link, usePage } from '@inertiajs/react';
import { BellRing, CalendarCheck2, CheckCircle2, ListChecks, ShieldCheck } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

const features = [
    { icon: ListChecks, title: 'Prepare with confidence', description: 'Build a checklist for every errand, appointment, or important event.' },
    { icon: BellRing, title: 'Get reminded on time', description: 'Schedule reminders before it is time to leave, not after you arrive.' },
    {
        icon: CalendarCheck2,
        title: 'Keep plans in one place',
        description: 'See upcoming events, unfinished items, and completed plans at a glance.',
    },
];

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    const { url } = usePage();
    const isRegister = url.startsWith('/register');

    return (
        <main className="min-h-svh bg-[#050b18] text-white lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]">
            <section className="relative flex min-h-svh items-center overflow-hidden px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
                <div className="pointer-events-none absolute top-8 -left-32 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
                <div className="relative mx-auto w-full max-w-[500px]">
                    <Link href={route('home')} className="mb-10 inline-flex items-center gap-3" aria-label="AyNo home">
                        <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_10px_35px_rgba(37,99,235,0.35)]">
                            <CheckCircle2 className="size-6" strokeWidth={2.3} />
                        </span>
                        <span>
                            <span className="block text-xl font-bold tracking-tight">AyNo</span>
                            <span className="block text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">Never leave it behind</span>
                        </span>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">{title}</h1>
                        <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">{description}</p>
                    </div>

                    <nav className="mb-7 grid grid-cols-2 rounded-xl border border-white/[0.05] bg-white/[0.055] p-1" aria-label="Authentication">
                        <Link
                            href={route('login')}
                            className={`rounded-lg px-4 py-3 text-center text-sm font-semibold transition ${!isRegister ? 'bg-[#162a50] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Sign in
                        </Link>
                        <Link
                            href={route('register')}
                            className={`rounded-lg px-4 py-3 text-center text-sm font-semibold transition ${isRegister ? 'bg-[#162a50] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Register
                        </Link>
                    </nav>

                    {children}
                    <p className="mt-8 text-center text-xs text-slate-600">AyNo Personal Reminder Checklist</p>
                </div>
            </section>

            <aside className="relative hidden min-h-svh overflow-hidden bg-blue-600 lg:flex lg:items-center">
                <div className="absolute inset-0 bg-[linear-gradient(145deg,#2563eb_0%,#1150d2_52%,#07162f_100%)]" />
                <div className="absolute -top-24 -right-28 h-96 w-96 rounded-full border border-white/10 bg-white/[0.04]" />
                <div className="absolute -bottom-48 -left-32 h-[34rem] w-[34rem] rounded-full bg-black/20" />
                <div className="absolute top-[10%] left-[12%] h-px w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="relative z-10 mx-auto w-full max-w-2xl px-12 py-14 xl:px-20">
                    <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-blue-100 uppercase backdrop-blur-sm">
                        <ShieldCheck className="size-4" />
                        Your personal preparation space
                    </div>
                    <h2 className="max-w-xl text-4xl leading-[1.08] font-bold tracking-[-0.04em] text-white xl:text-5xl">
                        Remember what matters before you leave.
                    </h2>
                    <p className="mt-5 max-w-xl text-base leading-7 text-blue-100/85 xl:text-lg">
                        AyNo turns every important plan into a clear, timely checklist so forgotten receipts, IDs, and documents stop becoming
                        last-minute problems.
                    </p>
                    <div className="mt-10 space-y-3">
                        {features.map(({ icon: Icon, title: featureTitle, description: featureDescription }) => (
                            <div
                                key={featureTitle}
                                className="flex items-start gap-4 rounded-2xl border border-white/15 bg-black/15 px-5 py-4 backdrop-blur-sm"
                            >
                                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-lg shadow-blue-950/15">
                                    <Icon className="size-5" />
                                </span>
                                <span>
                                    <span className="block text-sm font-semibold text-white">{featureTitle}</span>
                                    <span className="mt-1 block text-sm leading-5 text-blue-100/75">{featureDescription}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </main>
    );
}
