import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Construction } from 'lucide-react';

interface ComingSoonProps {
    title: string;
    description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
    const breadcrumbs: BreadcrumbItem[] = [{ title, href: '#' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="flex flex-1 items-center justify-center p-6">
                <div className="border-sidebar-border/70 bg-background w-full max-w-lg rounded-2xl border p-8 text-center shadow-sm">
                    <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
                        <Construction className="size-7" />
                    </span>
                    <h1 className="mt-5 text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground mt-2 leading-7">{description}</p>
                    <p className="mt-5 text-sm font-medium text-blue-600">This section is ready for the next development step.</p>
                </div>
            </div>
        </AppLayout>
    );
}
