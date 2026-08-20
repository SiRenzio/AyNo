import { DashboardStatCard } from '@/components/dashboard/dashboard-stat-card';
import { EmptyEventSection } from '@/components/dashboard/empty-event-section';
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
    upcomingEvents: unknown[];
    completedEvents: unknown[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function Dashboard({ currentDate, statistics, upcomingEvents, completedEvents }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs} className="dark bg-[#030817]">
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col bg-[#050b18] px-5 py-7 text-white sm:px-7 lg:px-8 lg:py-8">
                <header className="border-b border-white/[0.07] pb-7">
                    <h1 className="text-3xl font-bold tracking-[-0.035em]">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500">{currentDate}</p>
                </header>

                <div className="grid gap-4 py-7 sm:grid-cols-2 xl:grid-cols-4">
                    <DashboardStatCard label="Total Events" value={statistics.total} accent="blue" />
                    <DashboardStatCard label="Upcoming" value={statistics.upcoming} accent="blue" />
                    <DashboardStatCard label="Overdue" value={statistics.overdue} accent="amber" />
                    <DashboardStatCard label="Completed" value={statistics.completed} accent="green" />
                </div>

                <div className="grid flex-1 gap-8 pb-8 xl:grid-cols-2">
                    <EmptyEventSection
                        title="Upcoming"
                        count={upcomingEvents.length}
                        emptyTitle="No upcoming events yet"
                        emptyDescription="Create your first event and add everything you need to remember before leaving."
                        accent="blue"
                        action={{ label: 'Add New Event', href: route('events.create'), icon: Plus }}
                    />
                    <EmptyEventSection
                        title="Recently Completed"
                        count={completedEvents.length}
                        emptyTitle="No completed events yet"
                        emptyDescription="Events you finish will appear here so you can quickly review what you accomplished."
                        accent="green"
                        action={{ label: 'Manage Events', href: route('events.index'), icon: CalendarRange }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
