import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { Link } from '@inertiajs/react';
import { Bell, CalendarPlus, CalendarRange, LayoutDashboard, LogOut, Settings, UserRound } from 'lucide-react';

// Navigation is grouped to keep the sidebar easy to scan as the app grows.
const navigationGroups: NavGroup[] = [
    {
        title: 'Core',
        items: [
            { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
            { title: 'Add New Event', url: '/events/create', icon: CalendarPlus },
            { title: 'Event Management', url: '/events', icon: CalendarRange },
            { title: 'Notifications', url: '/notifications', icon: Bell },
        ],
    },
    {
        title: 'Personalization',
        items: [
            { title: 'Profile', url: '/settings/profile', icon: UserRound },
            { title: 'Settings', url: '/settings/appearance', icon: Settings },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-sidebar-border/70 border-b px-2 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="rounded-xl">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="pt-2">
                <NavMain groups={navigationGroups} />
            </SidebarContent>

            <SidebarFooter className="border-sidebar-border/70 border-t p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Log out"
                            className="text-sidebar-foreground/70 h-10 rounded-lg hover:bg-red-500/10 hover:text-red-600"
                        >
                            <Link href={route('logout')} method="post" as="button">
                                <LogOut className="size-[18px]" />
                                <span>Log out</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
