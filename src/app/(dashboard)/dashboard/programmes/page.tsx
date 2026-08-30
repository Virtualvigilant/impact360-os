import { Sparkles } from 'lucide-react';
import { can, ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { listProgrammes } from '@/lib/data/programmes';
import { formatDateRange } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { FilterBar } from '@/components/primitives/filter-bar';
import { Pagination } from '@/components/primitives/pagination';
import { StatusBadge } from '@/components/primitives/status-badge';
import { EmptyState, Section } from '@/components/primitives/states';
import { CreateProgrammeDialog } from '@/components/programmes/create-programme-dialog';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Programmes · ITEK Internship OS' };

const STATUSES = ['draft', 'planned', 'open', 'active', 'paused', 'completed', 'archived'] as const;

export default async function ProgrammesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
    const session = await requireRole(ROLE_GROUPS.staff, '/dashboard/programmes');
    const params = await searchParams;

    const { data, error, schemaMissing } = await listProgrammes({
        search: params.q,
        status: STATUSES.includes(params.status as never) ? (params.status as (typeof STATUSES)[number]) : undefined,
        page: Number(params.page) || 1,
    });

    return (
        <div className="mx-auto max-w-6xl space-y-7">
            <PageHeader
                eyebrow="Programmes"
                title="Programme portfolio"
                description="Purpose, dates, capacity, tracks, supervision and completion rules — settled before an intake opens rather than improvised once interns arrive."
                icon={Sparkles}
                actions={can(session.role, 'programme:create') ? <CreateProgrammeDialog /> : undefined}
            />

            <FilterBar
                searchPlaceholder="Search programmes…"
                filters={[{ param: 'status', label: 'Status', options: STATUSES }]}
            />

            <Section error={error} schemaMissing={schemaMissing}>
                {data.rows.length === 0 ? (
                    <EmptyState
                        icon={Sparkles}
                        title="No programmes yet"
                        description="A programme is the container for everything else — tracks, opportunities, placements and completion rules. Create one to begin."
                    />
                ) : (
                    <>
                        <Card>
                            <CardContent className="divide-y p-0">
                                {data.rows.map((programme) => (
                                    <div key={programme.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold">{programme.name}</p>
                                                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                                    {programme.code}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {programme.cohort_label} ·{' '}
                                                {formatDateRange(programme.start_date, programme.end_date)}
                                            </p>
                                            {programme.description && (
                                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                                    {programme.description}
                                                </p>
                                            )}
                                        </div>
                                        <dl className="grid shrink-0 grid-cols-3 gap-6 text-right">
                                            <Figure label="Slots" value={programme.slots} />
                                            <Figure label="Hours/wk" value={programme.expected_hours_per_week} />
                                            <Figure label="Mode" value={programme.work_arrangement} />
                                        </dl>
                                        <StatusBadge status={programme.status} className="shrink-0" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Pagination page={data} label="programmes" />
                    </>
                )}
            </Section>
        </div>
    );
}

function Figure({ label, value }: { label: string; value: string | number }) {
    return (
        <div>
            <dd className="text-sm font-medium capitalize tabular-nums">{value}</dd>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
        </div>
    );
}
