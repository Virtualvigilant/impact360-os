import { BarChart3, Brain, TriangleAlert } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { getIntelligenceBoard } from '@/lib/data/governance';
import { formatPercent, formatRelativeTime, formatScore, humanise } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { StatusBadge } from '@/components/primitives/status-badge';
import { EmptyState, Section } from '@/components/primitives/states';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const metadata = { title: 'Programme intelligence · ITEK Internship OS' };

export default async function IntelligencePage() {
    await requireRole(ROLE_GROUPS.supervision, '/dashboard/intelligence');
    const { data, error, schemaMissing } = await getIntelligenceBoard();

    return (
        <div className="mx-auto max-w-6xl space-y-7">
            <PageHeader
                eyebrow="Intelligence"
                title="Programme intelligence"
                description="Health, risk and intervention signals, each traceable to the records that produced it."
                icon={BarChart3}
            />

            <Alert>
                <Brain className="h-4 w-4" aria-hidden />
                <AlertTitle>Assistive, not decisive</AlertTitle>
                <AlertDescription>
                    Nothing here selects, rejects, scores finally or disciplines anyone. Every signal states its reason and
                    every model output records its evidence, confidence and review status — so a person can disagree with
                    it, in writing, and be right.
                </AlertDescription>
            </Alert>

            <Section error={error} schemaMissing={schemaMissing}>
                <div className="space-y-7">
                    <section>
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Programme health
                        </h2>
                        {data.health.length === 0 ? (
                            <EmptyState title="No programmes yet" description="Create a programme to start measuring it." />
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {data.health.map((programme) => {
                                    const total = programme.active_interns + programme.completed_interns;
                                    const completion = total === 0 ? 0 : Math.round((programme.completed_interns / total) * 100);
                                    return (
                                        <Card key={programme.programme_id}>
                                            <CardHeader>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <CardTitle className="truncate text-base">{programme.name}</CardTitle>
                                                        <CardDescription className="truncate">
                                                            {programme.cohort_label || 'No cohort label'}
                                                        </CardDescription>
                                                    </div>
                                                    <StatusBadge status={programme.status} />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-3 gap-2 text-center">
                                                    <Figure label="Active" value={programme.active_interns} />
                                                    <Figure label="Completed" value={programme.completed_interns} />
                                                    <Figure
                                                        label="At risk"
                                                        value={programme.at_risk_interns}
                                                        danger={programme.at_risk_interns > 0}
                                                    />
                                                </div>
                                                <Progress value={completion} className="mt-4 h-1.5" />
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    {formatPercent(completion)} completed · mean evaluation{' '}
                                                    {formatScore(programme.average_score)}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TriangleAlert className="h-4 w-4 text-muted-foreground" aria-hidden />
                                    Open risk signals
                                </CardTitle>
                                <CardDescription>Rules that fired against a source record.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {data.risks.length === 0 ? (
                                    <Muted>No unresolved signals.</Muted>
                                ) : (
                                    data.risks.map((risk) => (
                                        <div key={risk.id} className="rounded-xl border p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium">{humanise(risk.signal_type)}</p>
                                                    {risk.placement?.intern && (
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {risk.placement.intern.full_name}
                                                        </p>
                                                    )}
                                                </div>
                                                <StatusBadge status={risk.level} />
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{risk.reason}</p>
                                            <p className="mt-2 text-xs text-muted-foreground/80">
                                                Detected {formatRelativeTime(risk.detected_at)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-muted-foreground" aria-hidden />
                                    Model insights
                                </CardTitle>
                                <CardDescription>Each awaiting, or carrying, a human review decision.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {data.insights.length === 0 ? (
                                    <Muted>No insights generated.</Muted>
                                ) : (
                                    data.insights.map((insight) => (
                                        <div key={insight.id} className="rounded-xl border p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="text-sm font-medium">{humanise(insight.insight_type)}</p>
                                                <StatusBadge status={insight.status} />
                                            </div>
                                            <p className="mt-2 text-sm leading-6">{insight.summary}</p>
                                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                {insight.confidence != null && (
                                                    <Badge variant="outline">
                                                        Confidence {formatPercent(Number(insight.confidence) * 100)}
                                                    </Badge>
                                                )}
                                                {insight.model_reference && (
                                                    <Badge variant="outline">{insight.model_reference}</Badge>
                                                )}
                                                <span>{formatRelativeTime(insight.generated_at)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Section>
        </div>
    );
}

function Figure({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) {
    return (
        <div>
            <p className={`text-lg font-semibold tabular-nums ${danger ? 'text-destructive' : ''}`}>{value}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        </div>
    );
}

function Muted({ children }: { children: React.ReactNode }) {
    return <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</p>;
}
