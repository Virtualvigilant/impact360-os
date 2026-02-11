'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    GraduationCap,
    Trophy,
    Settings,
    BarChart3,
    UserCog,
    Briefcase,
    BookOpen,
    FileText,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: string[];
}

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['member', 'mentor', 'admin'],
    },
    {
        title: 'My Projects',
        href: '/dashboard/projects',
        icon: FolderKanban,
        roles: ['member'],
    },
    {
        title: 'Learning Track',
        href: '/dashboard/track',
        icon: GraduationCap,
        roles: ['member'],
    },
    {
        title: 'Achievements',
        href: '/dashboard/achievements',
        icon: Trophy,
        roles: ['member'],
    },
    {
        title: 'Members',
        href: '/dashboard/members',
        icon: Users,
        roles: ['mentor', 'admin'],
    },
    {
        title: 'All Projects',
        href: '/dashboard/all-projects',
        icon: FolderKanban,
        roles: ['mentor', 'admin'],
    },
    {
        title: 'Cohorts',
        href: '/dashboard/cohorts',
        icon: UserCog,
        roles: ['admin'],
    },
    {
        title: 'Curriculum',
        href: '/dashboard/curriculum',
        icon: BookOpen,
        roles: ['admin'],
    },
    {
        title: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
        roles: ['admin'],
    },
    {
        title: 'Deployments',
        href: '/dashboard/deployments',
        icon: Briefcase,
        roles: ['admin'],
    },
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        roles: ['member', 'mentor', 'admin'],
    },
    {
        title: 'Submissions',
        href: '/dashboard/submissions',
        icon: FileText,
        roles: ['mentor', 'admin'],
    },
];

interface DashboardSidebarProps {
    className?: string;
    onNavClick?: () => void;
}

export function DashboardSidebar({ className, onNavClick }: DashboardSidebarProps) {
    const pathname = usePathname();
    const { profile } = useAuth();

    const filteredNavItems = navItems.filter((item) =>
        profile?.role ? item.roles.includes(profile.role) : false
    );

    return (
        <div className={cn('pb-12 min-h-screen', className)}>
            <div className="space-y-4 py-4">
                <div className="px-2 py-2">
                    <div className="space-y-1">
                        {filteredNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onNavClick}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-500/20'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4", isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-white")} />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}