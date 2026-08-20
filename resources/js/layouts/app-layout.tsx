import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
}

export default ({ children, breadcrumbs, className }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} className={className}>
        {children}
    </AppLayoutTemplate>
);
