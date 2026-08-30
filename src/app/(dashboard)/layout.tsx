import { requireSession } from '@/lib/auth/session';
import { listOwnNotifications } from '@/lib/data/notifications';
import { SessionProvider } from '@/components/shell/session-provider';
import { DashboardShell } from '@/components/shell/dashboard-shell';

/**
 * The dashboard is a Server Component boundary.
 *
 * Authentication resolves here, once, before anything renders — so there is no
 * authenticated-looking shell that flashes and then redirects, and no child component
 * that has to defend itself against a null profile.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await requireSession();
    const notifications = await listOwnNotifications(session.userId);

    return (
        <SessionProvider session={session}>
            <DashboardShell notifications={notifications}>{children}</DashboardShell>
        </SessionProvider>
    );
}
