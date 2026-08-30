import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { listInterns } from '@/lib/data/interns';
import { formatPercent, formatScore } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { FilterBar } from '@/components/primitives/filter-bar';
import { Pagination } from '@/components/primitives/pagination';
import { StatusBadge } from '@/components/primitives/status-badge';
import { EmptyState, Section } from '@/components/primitives/states';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const metadata = { title: 'Interns · ITEK Internship OS' };

const RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
const PLACEMENT_STATUSES = ['preboarding', 'onboarding', 'active', 'paused', 'completing', 'completed'] as const;

export default async function InternsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; risk?: string; status?: string; page?: string }>;
}) {
    await requireRole(ROLE_GROUPS.staff, '/dashboard/people');
    const params = await searchParams;

    const { data, error, schemaMissing } = await listInterns({
        search: params.q,
        risk: RISK_LEVELS.includes(params.risk as never) ? (params.risk as (typeof RISK_LEVELS)[number]) : undefined,
        status: PLACEMENT_STATUSES.includes(params.status as never)
            ? (params.status as (typeof PLACEMENT_STATUSES)[number])
            : undefined,
        page: Number(params.page) || 1,
    });

    return (
        <div className="mx-auto max-w-7xl space-y-7">
            <PageHeader
                eyebrow="People"
                title="Intern operating records"
                description="One reliable view of identity, placement, supervision, learning, work and risk. Every figure here is derived from source records — open a person to see what produced it."
                icon={GraduationCap}
            />

            <FilterBar
                searchPlaceholder="Search by name, email or track…"
                filters={[
                    { param: 'risk', label: 'Risk', options: RISK_LEVELS },
                    { param: 'status', label: 'Status', options: PLACEMENT_STATUSES },
                ]}
            />

            <Section error={error} schemaMissing={schemaMissing}>
                {data.rows.length === 0 ? (
                    <EmptyState
                        icon={GraduationCap}
                        title="No interns match"
                        description="Adjust the filters, or create a placement once an offer has been accepted."
                    />
                ) : (
                    <>
                        <Card>
                            <CardContent className="p-0">
                                <ul className="divide-y">
                                    {data.rows.map((intern) => (
                                        <li key={intern.placement_id}>
                                            <Link
                                                href={`/dashboard/people/${intern.placement_id}`}
                                                className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate text-sm font-semibold">{intern.full_name}</p>
                                                        <StatusBadge status={intern.status} />
                                                    </div>
                                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                                        {intern.programme_name || 'Programme pending'} ·{' '}
                                                        {intern.track_name || 'Track pending'} ·{' '}
                                                        {intern.current_phase || 'Phase pending'}
                                                    </p>
                                                    <div className="mt-2.5 max-w-xs">
                                                        <Progress value={intern.learning_progress} className="h-1.5" />
                                                    </div>
                                                </div>

                                                <dl className="grid shrink-0 grid-cols-4 gap-5 text-right sm:gap-7">
                                                    <Figure label="Learning" value={formatPercent(intern.learning_progress)} />
                                                    <Figure label="Attendance" value={formatPercent(intern.attendance_rate)} />
                                                    <Figure label="Score" value={formatScore(intern.performance_score, 5, '—')} />
                                                    <Figure label="Open" value={intern.open_tasks} />
                                                </dl>

                                                <StatusBadge status={intern.risk_level} className="shrink-0" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Pagination page={data} label="interns" />
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
