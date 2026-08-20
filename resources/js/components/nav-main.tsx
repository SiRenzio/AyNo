import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface NavMainProps {
    groups: NavGroup[];
}

export function NavMain({ groups }: NavMainProps) {
    const page = usePage();

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
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    ));
}
