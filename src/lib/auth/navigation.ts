/**
 * Route access map.
 *
 * Both the sidebar and `proxy.ts` read this, so a route can never be reachable by
 * someone the navigation hides it from — the previous behaviour, where the sidebar was
 * the only thing keeping an intern out of /dashboard/admin.
 */
import type { LucideIcon } from 'lucide-react';
import {
    Activity,
    BarChart3,
    BookOpenCheck,
    BriefcaseBusiness,
    CalendarDays,
    ClipboardCheck,
    FileCheck2,
    FolderKanban,
    GraduationCap,
    LayoutDashboard,
    ListChecks,
    MessageSquareText,
    Settings,
    ShieldCheck,
    Sparkles,
    Target,
    UserRoundSearch,
    UsersRound,
} from 'lucide-react';
import { ROLE_GROUPS, type AppRole } from './roles';

export const NAV_SECTIONS = [
    'command',
    'workspace',
    'people',
    'programmes',
    'talent',
    'development',
    'performance',
    'operations',
    'outcomes',
    'intelligence',
    'admin',
] as const;

export type NavSection = (typeof NAV_SECTIONS)[number];

export const SECTION_LABELS: Record<NavSection, string> = {
    command: 'Command',
    workspace: 'Workspace',
    people: 'People',
    programmes: 'Programmes',
    talent: 'Talent pipeline',
    development: 'Development',
    performance: 'Performance',
    operations: 'Operations',
    outcomes: 'Outcomes',
    intelligence: 'Intelligence',
    admin: 'Admin',
};

export interface NavRoute {
    title: string;
    href: string;
    icon: LucideIcon;
    section: NavSection;
    roles: readonly AppRole[];
    /** Shown in the command palette and as the page's short description. */
    hint: string;
}

const { everyone, staff, programmeLeaders, talentTeam, supervision, participants } = ROLE_GROUPS;

export const NAV_ROUTES: readonly NavRoute[] = [
    { title: 'Command center', href: '/dashboard', icon: LayoutDashboard, section: 'command', roles: everyone, hint: 'Your role-specific overview' },

    { title: 'My work', href: '/dashboard/work', icon: BriefcaseBusiness, section: 'workspace', roles: participants, hint: 'Your delivery queue and evidence' },
    { title: 'Projects', href: '/dashboard/projects', icon: FolderKanban, section: 'workspace', roles: [...staff, ...participants], hint: 'Project workspaces and delivery health' },
    { title: 'Tasks', href: '/dashboard/tasks', icon: ListChecks, section: 'workspace', roles: [...staff, ...participants], hint: 'The delivery board' },
    { title: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays, section: 'workspace', roles: everyone, hint: 'Workshops, reviews and deadlines' },

    { title: 'Interns', href: '/dashboard/people', icon: GraduationCap, section: 'people', roles: staff, hint: 'Intern operating records' },
    { title: 'Mentors & supervisors', href: '/dashboard/mentors', icon: UsersRound, section: 'people', roles: programmeLeaders, hint: 'Supervision capacity and load' },

    { title: 'Programmes', href: '/dashboard/programmes', icon: Sparkles, section: 'programmes', roles: [...staff], hint: 'Intakes, tracks and completion rules' },
    { title: 'Opportunities', href: '/dashboard/opportunities', icon: BriefcaseBusiness, section: 'programmes', roles: talentTeam, hint: 'Published internship positions' },

    { title: 'Applications', href: '/dashboard/applications', icon: UserRoundSearch, section: 'talent', roles: talentTeam, hint: 'The candidate pipeline' },
    { title: 'Interviews & offers', href: '/dashboard/selection', icon: ClipboardCheck, section: 'talent', roles: talentTeam, hint: 'Structured scoring and offers' },

    { title: 'Learning & goals', href: '/dashboard/development', icon: Target, section: 'development', roles: [...supervision, ...participants], hint: 'Competency goals and progress' },
    { title: 'Check-ins & feedback', href: '/dashboard/check-ins', icon: MessageSquareText, section: 'development', roles: [...supervision, ...participants], hint: 'The weekly reflection rhythm' },
    { title: 'Learning hub', href: '/dashboard/learning', icon: BookOpenCheck, section: 'development', roles: [...supervision, ...participants], hint: 'Resources tied to competencies' },

    { title: 'Evaluations', href: '/dashboard/performance', icon: Activity, section: 'performance', roles: [...supervision, ...participants, 'external_reviewer'], hint: 'Rubric-based assessment' },

    { title: 'Operations', href: '/dashboard/operations', icon: ShieldCheck, section: 'operations', roles: [...supervision, ...participants], hint: 'Attendance, leave, documents, assets' },

    { title: 'Completion & alumni', href: '/dashboard/outcomes', icon: FileCheck2, section: 'outcomes', roles: [...supervision, ...participants, 'alumni'], hint: 'Certification and next opportunity' },

    { title: 'Programme intelligence', href: '/dashboard/intelligence', icon: BarChart3, section: 'intelligence', roles: supervision, hint: 'Explainable health and risk signals' },

    { title: 'Governance & settings', href: '/dashboard/admin', icon: Settings, section: 'admin', roles: programmeLeaders, hint: 'Roles, policies, privacy, audit' },
] as const;

/** Routes that need no session at all. */
export const PUBLIC_ROUTES = ['/', '/opportunities', '/sign-in', '/sign-up'] as const;

/** Routes every signed-in person may reach regardless of role. */
const ALWAYS_ALLOWED = ['/dashboard/profile', '/dashboard/support'];

/** The command center is the dashboard index; it must not act as a prefix. */
const INDEX_ROUTE = '/dashboard';

/**
 * Longest-prefix match, so `/dashboard/projects/<id>` inherits `/dashboard/projects`
 * and a nested route can never be more permissive than its parent by accident.
 *
 * `/dashboard` itself is matched exactly. Treating it as a prefix made it the fallback
 * parent for every unmapped path, so a route nobody had granted access to inherited the
 * command center's "everyone" permission.
 */
export function routeFor(pathname: string): NavRoute | undefined {
    return [...NAV_ROUTES]
        .filter((route) =>
            route.href === INDEX_ROUTE
                ? pathname === INDEX_ROUTE
                : pathname === route.href || pathname.startsWith(`${route.href}/`),
        )
        .sort((a, b) => b.href.length - a.href.length)[0];
}

export function canAccessRoute(role: AppRole | null | undefined, pathname: string): boolean {
    if (!role) return false;
    if (ALWAYS_ALLOWED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
        return true;
    }
    const route = routeFor(pathname);
    // An unmapped route under /dashboard is denied rather than allowed: adding a page
    // must be a deliberate access decision.
    if (!route) return false;
    return route.roles.includes(role);
}

export function visibleRoutes(role: AppRole | null | undefined): NavRoute[] {
    if (!role) return [];
    return NAV_ROUTES.filter((route) => route.roles.includes(role));
}
