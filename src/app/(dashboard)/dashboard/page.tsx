import { Suspense } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { requireSession } from '@/lib/auth/session';
import { loadCommandCenter } from '@/lib/data/command-center';
import { ROLE_LABELS } from '@/lib/auth/roles';
import { PageHeader } from '@/components/primitives/page-header';
import { CardsSkeleton, Section } from '@/components/primitives/states';
import { AccessDeniedNotice } from '@/components/dashboard/access-denied-notice';
import { InternCommandCenter } from '@/components/dashboard/intern-command-center';
import { SupervisionCommandCenter } from '@/components/dashboard/supervision-command-center';
import { TalentCommandCenter } from '@/components/dashboard/talent-command-center';
import { LeadershipCommandCenter } from '@/components/dashboard/leadership-command-center';
import { AlumniCommandCenter } from '@/components/dashboard/alumni-command-center';

export const metadata = { title: 'Command center · ITEK Internship OS' };

/**
 * The command center renders one of five dashboards.
 *
 * A single component that branched on role internally could not describe what any one
 * role actually sees; each of these takes a typed payload it fully consumes.
 */
async function CommandCenterContent({ denied }: { denied: boolean }) {
    const session = await requireSession();
    const { data, error, schemaMissing } = await loadCommandCenter(session.userId, session.role);

    return (
        <>
            {denied && <AccessDeniedNotice />}
            <Section error={error} schemaMissing={schemaMissing}>
                {data.kind === 'intern' && <InternCommandCenter data={data} name={session.profile.full_name} />}
                {data.kind === 'supervision' && <SupervisionCommandCenter data={data} />}
                {data.kind === 'talent' && <TalentCommandCenter data={data} />}
                {data.kind === 'leadership' && <LeadershipCommandCenter data={data} />}
                {data.kind === 'alumni' && <AlumniCommandCenter data={data} />}
            </Section>
        </>
    );
}

export default async function CommandCenterPage({
    searchParams,
}: {
    searchParams: Promise<{ denied?: string }>;
}) {
    const session = await requireSession();
    const { denied } = await searchParams;

    const firstName = session.profile.full_name?.split(' ')[0];

    return (
        <div className="mx-auto max-w-7xl space-y-7">
            <PageHeader
                eyebrow={ROLE_LABELS[session.role]}
                title={firstName ? `Welcome back, ${firstName}` : 'Command center'}
                description="What needs your attention today, drawn from the same records the rest of the system reports on."
                icon={LayoutDashboard}
            />
            <Suspense fallback={<CardsSkeleton />}>
                <CommandCenterContent denied={denied === '1'} />
            </Suspense>
        </div>
    );
}
