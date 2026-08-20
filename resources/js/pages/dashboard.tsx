import { DashboardStatCard } from '@/components/dashboard/dashboard-stat-card';
import { EmptyEventSection } from '@/components/dashboard/empty-event-section';
import { ManagedEvent } from '@/components/events/event-types';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CalendarRange, Plus } from 'lucide-react';

interface DashboardStatistics {
    total: number;
    upcoming: number;
    overdue: number;
    completed: number;
}

interface DashboardProps {
    currentDate: string;
    statistics: DashboardStatistics;
    upcomingEvents: ManagedEvent[];
    completedEvents: ManagedEvent[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function Dashboard({ currentDate, statistics, upcomingEvents, completedEvents }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs} className="bg-slate-50 dark:bg-[#030817]">
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col bg-slate-50 px-4 py-6 text-slate-950 sm:px-7 sm:py-7 lg:px-8 lg:py-8 dark:bg-[#050b18] dark:text-white">
                <header className="border-b border-slate-200 pb-7 dark:border-white/[0.07]">
                    <h1 className="text-3xl font-bold tracking-[-0.035em]">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{currentDate}</p>
                </header>

                <div className="grid grid-cols-2 gap-2.5 py-6 sm:gap-4 sm:py-7 xl:grid-cols-4">
                    <DashboardStatCard label="Total Events" value={statistics.total} accent="blue" />
                    <DashboardStatCard label="Upcoming" value={statistics.upcoming} accent="blue" />
                    <DashboardStatCard label="Overdue" value={statistics.overdue} accent="amber" />
                    <DashboardStatCard label="Completed" value={statistics.completed} accent="green" />
                </div>

                <div className="grid flex-1 gap-8 pb-5 sm:pb-8">
                    <EmptyEventSection
                        title="Upcoming"
                        count={upcomingEvents.length}
                        emptyTitle="No upcoming events yet"
                        emptyDescription="Create your first event and add everything you need to remember before leaving."
                        accent="blue"
                        action={{ label: 'Add New Event', href: route('events.create'), icon: Plus }}
                        events={upcomingEvents}
                    />
                    <EmptyEventSection
                        title="Recently Completed"
                        count={completedEvents.length}
                        emptyTitle="No completed events yet"
                        emptyDescription="Events you finish will appear here so you can quickly review what you accomplished."
                        accent="green"
                        action={{ label: 'Manage Events', href: route('events.index'), icon: CalendarRange }}
                        events={completedEvents}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
