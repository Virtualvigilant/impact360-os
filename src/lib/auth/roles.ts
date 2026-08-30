/**
 * The single definition of who may do what.
 *
 * Role strings used to be duplicated as inline arrays in the sidebar, the workspace
 * component, the auth hook and the SQL policies. They drifted. Everything in the
 * application layer now derives from this file, and it mirrors `public.app_role`.
 */
import type { Enums } from '@/types/database';

export type AppRole = Enums<'app_role'>;

export const APP_ROLES = [
    'super_admin',
    'programme_admin',
    'recruiter',
    'mentor',
    'supervisor',
    'intern',
    'alumni',
    'external_reviewer',
] as const satisfies readonly AppRole[];

export function isAppRole(value: unknown): value is AppRole {
    return typeof value === 'string' && (APP_ROLES as readonly string[]).includes(value);
}

export const ROLE_LABELS: Record<AppRole, string> = {
    super_admin: 'Super administrator',
    programme_admin: 'Programme administrator',
    recruiter: 'Recruiter',
    mentor: 'Mentor',
    supervisor: 'Supervisor',
    intern: 'Intern',
    alumni: 'Alumnus',
    external_reviewer: 'External reviewer',
};

/** Role groupings, named after the job rather than the org chart. */
export const ROLE_GROUPS = {
    /** Final authority over the platform. */
    platformOwners: ['super_admin'],
    /** Runs programmes: placements, operations, outcomes, governance. */
    programmeLeaders: ['super_admin', 'programme_admin'],
    /** Owns the recruitment funnel. */
    talentTeam: ['super_admin', 'programme_admin', 'recruiter'],
    /** Supervises an intern's day-to-day work and development. */
    supervision: ['super_admin', 'programme_admin', 'mentor', 'supervisor'],
    /** Anyone employed by ITEK who works inside a programme. */
    staff: ['super_admin', 'programme_admin', 'recruiter', 'mentor', 'supervisor'],
    /** People being developed by a programme. */
    participants: ['intern'],
    /** Everyone who can sign in. */
    everyone: [...APP_ROLES],
} as const satisfies Record<string, readonly AppRole[]>;

export type RoleGroup = keyof typeof ROLE_GROUPS;

export function hasRole(role: AppRole | null | undefined, allowed: readonly AppRole[]): boolean {
    return role != null && allowed.includes(role);
}

export function inGroup(role: AppRole | null | undefined, group: RoleGroup): boolean {
    return hasRole(role, ROLE_GROUPS[group]);
}

/**
 * Named capabilities. Components ask "may this person approve an evaluation?" rather
 * than re-deriving a role list, so a permission change happens in exactly one place.
 *
 * This is defence in depth, not the security boundary. Row-level security in Postgres
 * is the boundary; these checks decide what the interface offers.
 */
export const PERMISSIONS = {
    'programme:create': ROLE_GROUPS.programmeLeaders,
    'programme:edit': ROLE_GROUPS.programmeLeaders,
    'opportunity:manage': ROLE_GROUPS.talentTeam,
    'application:review': ROLE_GROUPS.talentTeam,
    'application:decide': ROLE_GROUPS.talentTeam,
    'interview:schedule': ROLE_GROUPS.talentTeam,
    'offer:issue': ROLE_GROUPS.talentTeam,
    'placement:manage': ROLE_GROUPS.programmeLeaders,
    'project:manage': ROLE_GROUPS.supervision,
    'task:assign': ROLE_GROUPS.supervision,
    'task:review': ROLE_GROUPS.supervision,
    'task:submit': ROLE_GROUPS.participants,
    'checkin:submit': ROLE_GROUPS.participants,
    'checkin:review': ROLE_GROUPS.supervision,
    'feedback:give': ROLE_GROUPS.supervision,
    'evaluation:author': [...ROLE_GROUPS.supervision, 'external_reviewer'],
    'evaluation:lock': ROLE_GROUPS.programmeLeaders,
    'attendance:record': [...ROLE_GROUPS.supervision, ...ROLE_GROUPS.participants],
    'leave:approve': ROLE_GROUPS.supervision,
    'concern:triage': ROLE_GROUPS.programmeLeaders,
    'outcome:certify': ROLE_GROUPS.programmeLeaders,
    'intelligence:view': ROLE_GROUPS.supervision,
    'governance:manage': ROLE_GROUPS.programmeLeaders,
    'role:assign': ROLE_GROUPS.programmeLeaders,
    'audit:read': ROLE_GROUPS.programmeLeaders,
} as const satisfies Record<string, readonly AppRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: AppRole | null | undefined, permission: Permission): boolean {
    return hasRole(role, PERMISSIONS[permission]);
}
