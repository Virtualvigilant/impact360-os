import { Activity } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { listEvaluations } from '@/lib/data/development';
import { formatRelativeTime, formatScore, humanise } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { Pagination } from '@/components/primitives/pagination';
import { StatusBadge } from '@/components/primitives/status-badge';
import { EmptyState, Section } from '@/components/primitives/states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Evaluations · ITEK Internship OS' };

export default async function PerformancePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    await requireRole(
        [...ROLE_GROUPS.supervision, ...ROLE_GROUPS.participants, 'external_reviewer'],
        '/dashboard/performance',
    );
    const params = await searchParams;
    const { data, error, schemaMissing } = await listEvaluations({ page: Number(params.page) || 1 });

    return (
        <div className="mx-auto max-w-5xl space-y-7">
            <PageHeader
                eyebrow="Performance"
                title="Evaluations"
                description="Rubric-based assessment across multiple sources. Every criterion score carries a written justification — a number on its own is not an assessment."
                icon={Activity}
            />

            <Section error={error} schemaMissing={schemaMissing}>
                {data.rows.length === 0 ? (
                    <EmptyState
                        icon={Activity}
                        title="No evaluations recorded"
                        description="Baseline, midpoint and final evaluations are authored against a rubric. Create a rubric first, then evaluate against it."
                    />
                ) : (
                    <>
                        <Card>
                            <CardContent className="divide-y p-0">
                                {data.rows.map((evaluation) => (
                                    <div key={evaluation.id} className="p-4">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold">
                                                    {humanise(evaluation.evaluation_type)} evaluation
                                                    {evaluation.placement?.intern
                                                        ? ` · ${evaluation.placement.intern.full_name}`
                                                        : ''}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {evaluation.evaluator?.full_name ?? 'Evaluator'} ·{' '}
                                                    {evaluation.rubric?.name ?? 'No rubric'} ·{' '}
                                                    {formatRelativeTime(evaluation.created_at)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">{humanise(evaluation.source)}</Badge>
                                                <span className="text-sm font-medium tabular-nums">
                                                    {formatScore(evaluation.overall_score)}
                                                </span>
                                                <StatusBadge status={evaluation.status} />
                                            </div>
                                        </div>

                                        {evaluation.strengths && (
                                            <Field label="Strengths" value={evaluation.strengths} />
                                        )}
                                        {evaluation.development_areas && (
                                            <Field label="Development areas" value={evaluation.development_areas} />
                                        )}
                                        {evaluation.recommendation && (
                                            <Field label="Recommendation" value={evaluation.recommendation} />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Pagination page={data} label="evaluations" />
                    </>
                )}
            </Section>
        </div>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm leading-6">{value}</p>
        </div>
    );
}
