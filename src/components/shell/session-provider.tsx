'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Session } from '@/lib/auth/session';
import { can, inGroup, type Permission, type RoleGroup } from '@/lib/auth/roles';

/**
 * The session, resolved once on the server and handed down.
 *
 * The old `useAuth()` hook re-derived this in the browser: every component that called
 * it opened its own Supabase client, fetched the session, then fetched the profile —
 * so a page with a header, a sidebar and three cards issued six round trips for one
 * person's identity, and each rendered a loading spinner while it waited.
 */
interface SessionContextValue {
    session: Session;
    can: (permission: Permission) => boolean;
    inGroup: (group: RoleGroup) => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ session, children }: { session: Session; children: ReactNode }) {
    const value: SessionContextValue = {
        session,
        can: (permission) => can(session.role, permission),
        inGroup: (group) => inGroup(session.role, group),
    };
    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used inside the dashboard layout.');
    }
    return context;
}
