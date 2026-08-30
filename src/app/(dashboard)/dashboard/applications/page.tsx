import { UserRoundSearch } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { listApplications, pipelineCounts, PIPELINE_STAGES, TERMINAL_STAGES, type ApplicationStatus } from '@/lib/data/applications';
import { PageHeader } from '@/components/primitives/page-header';
import { FilterBar } from '@/components/primitives/filter-bar';
import { Pagination } from '@/components/primitives/pagination';
import { EmptyState, Section } from '@/components/primitives/states';
import { PipelineFunnel } from '@/components/applications/pipeline-funnel';
import { ApplicationRow } from '@/components/applications/application-row';

export const metadata = { title: 'Applications · ITEK Internship OS' };

const ALL_STATUSES = [...PIPELINE_STAGES, ...TERMINAL_STAGES];

export default async function ApplicationsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
    await requireRole(ROLE_GROUPS.talentTeam, '/dashboard/applications');
    const params = await searchParams;
    const status = ALL_STATUSES.includes(params.status as ApplicationStatus)
        ? (params.status as ApplicationStatus)
        : undefined;

    // The funnel counts every stage in the database; the list is one page of one stage.
    // Deriving the funnel from the list would make it lie as soon as paging kicked in.
    const [applications, counts] = await Promise.all([
        listApplications({ search: params.q, status, page: Number(params.page) || 1 }),
        pipelineCounts(),
    ]);

    return (
        <div className="mx-auto max-w-7xl space-y-7">
            <PageHeader
                eyebrow="Talent pipeline"
                title="Applications"
                description="An evidence-backed pipeline. Every stage change records who decided, when, and why — assistive scoring informs a human decision, it never makes one."
                icon={UserRoundSearch}
            />

            <Section error={counts.error} schemaMissing={counts.schemaMissing}>
                <PipelineFunnel counts={counts.data} active={status} />
            </Section>

            <FilterBar
                searchPlaceholder="Search by name, email or application number…"
                filters={[{ param: 'status', label: 'Stage', options: ALL_STATUSES }]}
            />

            <Section error={applications.error} schemaMissing={applications.schemaMissing}>
                {applications.data.rows.length === 0 ? (
                    <EmptyState
                        icon={UserRoundSearch}
                        title="No applications match"
                        description="Applications arrive once an opportunity is published on the public catalogue."
                    />
                ) : (
                    <>
                        <div className="space-y-3">
                            {applications.data.rows.map((application) => (
                                <ApplicationRow key={application.id} application={application} />
                            ))}
                        </div>
                        <Pagination page={applications.data} label="applications" />
                    </>
                )}
            </Section>
        </div>
    );
}
