import { describe, expect, it } from 'vitest';
import { APP_ROLES, can, hasRole, inGroup, isAppRole, PERMISSIONS, ROLE_LABELS } from '@/lib/auth/roles';
import { canAccessRoute, NAV_ROUTES, routeFor, visibleRoutes } from '@/lib/auth/navigation';

describe('roles', () => {
    it('labels every role', () => {
        for (const role of APP_ROLES) {
            expect(ROLE_LABELS[role]).toBeTruthy();
        }
    });

    it('rejects values that are not roles', () => {
        // 'member' and 'admin' were legacy aliases scattered through the old code.
        // They are not roles in this schema and must not be treated as one.
        expect(isAppRole('member')).toBe(false);
        expect(isAppRole('admin')).toBe(false);
        expect(isAppRole('super_admin')).toBe(true);
        expect(isAppRole(null)).toBe(false);
    });

    it('treats a missing role as having no access', () => {
        expect(hasRole(null, APP_ROLES)).toBe(false);
        expect(inGroup(undefined, 'programmeLeaders')).toBe(false);
        expect(can(null, 'role:assign')).toBe(false);
    });

    it('grants every permission to super_admin', () => {
        for (const permission of Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]) {
            // Except the ones that belong to the person being developed, not to staff.
            if (permission === 'task:submit' || permission === 'checkin:submit') continue;
            expect(can('super_admin', permission), permission).toBe(true);
        }
    });

    it('does not let an intern review or decide', () => {
        expect(can('intern', 'task:review')).toBe(false);
        expect(can('intern', 'application:decide')).toBe(false);
        expect(can('intern', 'role:assign')).toBe(false);
        expect(can('intern', 'evaluation:author')).toBe(false);
        expect(can('intern', 'governance:manage')).toBe(false);
    });

    it('keeps role assignment with programme leadership only', () => {
        expect(can('programme_admin', 'role:assign')).toBe(true);
        expect(can('super_admin', 'role:assign')).toBe(true);
        expect(can('mentor', 'role:assign')).toBe(false);
        expect(can('recruiter', 'role:assign')).toBe(false);
        expect(can('supervisor', 'role:assign')).toBe(false);
    });

    it('keeps recruitment decisions with the talent team', () => {
        expect(can('recruiter', 'application:decide')).toBe(true);
        expect(can('mentor', 'application:decide')).toBe(false);
        expect(can('supervisor', 'application:decide')).toBe(false);
    });
});

describe('route access', () => {
    it('denies everything to a signed-out visitor', () => {
        expect(canAccessRoute(null, '/dashboard')).toBe(false);
        expect(canAccessRoute(undefined, '/dashboard/admin')).toBe(false);
    });

    it('denies an unmapped dashboard route rather than allowing it', () => {
        // Adding a page must be a deliberate access decision, not a default-open one.
        expect(canAccessRoute('super_admin', '/dashboard/something-new')).toBe(false);
    });

    it('keeps an intern out of governance, whatever the sidebar shows', () => {
        // This was the real hole: the sidebar hid /dashboard/admin, and typing the URL worked.
        expect(canAccessRoute('intern', '/dashboard/admin')).toBe(false);
        expect(canAccessRoute('intern', '/dashboard/mentors')).toBe(false);
        expect(canAccessRoute('intern', '/dashboard/applications')).toBe(false);
    });

    it('lets an intern reach their own workspace', () => {
        expect(canAccessRoute('intern', '/dashboard')).toBe(true);
        expect(canAccessRoute('intern', '/dashboard/work')).toBe(true);
        expect(canAccessRoute('intern', '/dashboard/check-ins')).toBe(true);
        expect(canAccessRoute('intern', '/dashboard/profile')).toBe(true);
    });

    it('gives a nested route the same access as its parent', () => {
        expect(canAccessRoute('mentor', '/dashboard/people/abc-123')).toBe(true);
        expect(canAccessRoute('intern', '/dashboard/people/abc-123')).toBe(false);
    });

    it('matches the longest prefix, so a nested route cannot inherit the wrong parent', () => {
        expect(routeFor('/dashboard/projects/abc')?.href).toBe('/dashboard/projects');
        expect(routeFor('/dashboard')?.href).toBe('/dashboard');
    });

    it('only shows a route in the sidebar if the role may open it', () => {
        for (const role of APP_ROLES) {
            for (const route of visibleRoutes(role)) {
                expect(canAccessRoute(role, route.href), `${role} → ${route.href}`).toBe(true);
            }
        }
    });

    it('gives every role somewhere to land', () => {
        for (const role of APP_ROLES) {
            expect(visibleRoutes(role).length, role).toBeGreaterThan(0);
            expect(canAccessRoute(role, '/dashboard'), role).toBe(true);
        }
    });

    it('has no duplicate hrefs in the route map', () => {
        const hrefs = NAV_ROUTES.map((route) => route.href);
        expect(new Set(hrefs).size).toBe(hrefs.length);
    });
});
