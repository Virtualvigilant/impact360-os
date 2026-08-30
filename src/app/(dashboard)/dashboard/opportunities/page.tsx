import Link from 'next/link';
import { BriefcaseBusiness, ExternalLink } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { listOpenProgrammes, listOpportunities } from '@/lib/data/programmes';
import { formatDate, humanise } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { FilterBar } from '@/components/primitives/filter-bar';
import { Pagination } from '@/components/primitives/pagination';
import { StatusBadge } from '@/components/primitives/status-badge';
import { EmptyState, Section } from '@/components/primitives/states';
import { CreateOpportunityDialog } from '@/components/programmes/create-opportunity-dialog';
import { PublishToggle } from '@/components/programmes/publish-toggle';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Opportunities · ITEK Internship OS' };

const STATUSES = ['draft', 'published', 'closed', 'filled', 'archived'] as const;

export default async function OpportunitiesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
    await requireRole(ROLE_GROUPS.talentTeam, '/dashboard/opportunities');
    const params = await searchParams;

    const [opportunities, programmes] = await Promise.all([
        listOpportunities({
            search: params.q,
            status: STATUSES.includes(params.status as never) ? (params.status as (typeof STATUSES)[number]) : undefined,
            page: Number(params.page) || 1,
        }),
        listOpenProgrammes(),
    ]);

    return (
        <div className="mx-auto max-w-6xl space-y-7">
            <PageHeader
                eyebrow="Programmes"
                title="Internship opportunities"
                description="Clear positions with real responsibilities, honest qualifications and the project context a candidate needs to decide whether to apply."
                icon={BriefcaseBusiness}
                actions={<CreateOpportunityDialog programmes={programmes} />}
            />

            <FilterBar
                searchPlaceholder="Search opportunities…"
                filters={[{ param: 'status', label: 'Status', options: STATUSES }]}
            />

            <Section error={opportunities.error} schemaMissing={opportunities.schemaMissing}>
                {opportunities.data.rows.length === 0 ? (
                    <EmptyState
                        icon={BriefcaseBusiness}
                        title="No opportunities yet"
                        description={
                            programmes.length === 0
                                ? 'Create a programme first — an opportunity always belongs to one.'
                                : 'Publish an opportunity to open the public catalogue and start receiving applications.'
                        }
                    />
                ) : (
                    <>
                        <Card>
                            <CardContent className="divide-y p-0">
                                {opportunities.data.rows.map((opportunity) => (
                                    <div key={opportunity.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold">{opportunity.title}</p>
                                                {opportunity.status === 'published' && (
                                                    <Link
                                                        href={`/opportunities/${opportunity.slug}`}
                                                        target="_blank"
                                                        className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                                                    >
                                                        View public page
                                                        <ExternalLink className="h-3 w-3" aria-hidden />
                                                    </Link>
                                                )}
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {opportunity.programme?.name ?? 'Programme'} ·{' '}
                                                {opportunity.track?.name ?? 'All tracks'} ·{' '}
                                                {humanise(opportunity.work_arrangement)}
                                                {opportunity.location ? ` · ${opportunity.location}` : ''}
                                            </p>
                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                                {opportunity.summary}
                                            </p>
                                        </div>

                                        <dl className="grid shrink-0 grid-cols-2 gap-6 text-right">
                                            <Figure label="Slots" value={opportunity.slots} />
                                            <Figure
                                                label="Closes"
                                                value={opportunity.closes_at ? formatDate(opportunity.closes_at) : 'Open'}
                                            />
                                        </dl>

                                        <div className="flex shrink-0 items-center gap-2">
                                            <StatusBadge status={opportunity.status} />
                                            <PublishToggle
                                                opportunityId={opportunity.id}
                                                published={opportunity.status === 'published'}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Pagination page={opportunities.data} label="opportunities" />
                    </>
                )}
            </Section>
        </div>
    );
}

function Figure({ label, value }: { label: string; value: string | number }) {
    return (
        <div>
            <dd className="text-sm font-medium tabular-nums">{value}</dd>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
        </div>
    );
}
