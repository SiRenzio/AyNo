import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface NavMainProps {
    groups: NavGroup[];
}

export function NavMain({ groups }: NavMainProps) {
    const page = usePage<SharedData>();

    return groups.map((group) => (
        <SidebarGroup key={group.title} className="px-2 py-2">
            <SidebarGroupLabel className="text-sidebar-foreground/45 px-2 text-[10px] font-bold tracking-[0.16em] uppercase">
                {group.title}
            </SidebarGroupLabel>

            <SidebarMenu>
                {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={item.url === page.url}
                            tooltip={item.title}
                            className="h-10 rounded-lg data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:shadow-sm data-[active=true]:hover:bg-blue-600"
                        >
                            <Link href={item.url} prefetch>
                                {item.icon && <item.icon className="size-[18px]" />}
                                <span>{item.title}</span>
                                {item.url === '/notifications' && page.props.auth.active_notifications > 0 && (
                                    <span
                                        aria-label={`${page.props.auth.active_notifications} active notifications`}
                                        className={`ml-auto flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:top-0.5 group-data-[collapsible=icon]:right-0.5 group-data-[collapsible=icon]:min-w-4 group-data-[collapsible=icon]:px-1 ${page.url === item.url ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}
                                    >
                                        {page.props.auth.active_notifications > 99 ? '99+' : page.props.auth.active_notifications}
                                    </span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    ));
}
