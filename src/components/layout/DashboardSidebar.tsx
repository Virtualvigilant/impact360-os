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
];

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const filteredNavItems = navItems.filter((item) =>
    profile?.role ? item.roles.includes(profile.role) : false
  );

  return (
    <div className={cn('pb-12 min-h-screen', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
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