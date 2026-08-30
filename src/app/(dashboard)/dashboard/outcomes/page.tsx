import { Award, FileCheck2 } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { completionProgress, getOutcomesBoard } from '@/lib/data/governance';
import { formatDate, formatScore, humanise } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { StatusBadge } from '@/components/primitives/status-badge';
import { EmptyState, Section } from '@/components/primitives/states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const metadata = { title: 'Completion and alumni · ITEK Internship OS' };

export default async function OutcomesPage() {
    await requireRole([...ROLE_GROUPS.supervision, ...ROLE_GROUPS.participants, 'alumni'], '/dashboard/outcomes');
    const { data, error, schemaMissing } = await getOutcomesBoard();

    return (
        <div className="mx-auto max-w-5xl space-y-7">
            <PageHeader
                eyebrow="Outcomes"
                title="Completion and alumni"
                description="Verify what was actually completed, issue the certificate that says so, and record honestly what this person is ready for next."
                icon={FileCheck2}
            />

            <Section error={error} schemaMissing={schemaMissing}>
                {data.outcomes.length === 0 ? (
                    <EmptyState
                        icon={FileCheck2}
                        title="No outcomes recorded"
                        description="An outcome is created as a placement approaches its end, once completion requirements can be verified against evidence."
                    />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {data.outcomes.map((outcome) => {
                            const progress = completionProgress(data.requirements, outcome.placement_id);
                            const certificate = data.certificates.find((item) => item.outcome_id === outcome.id);

                            return (
                                <Card key={outcome.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <CardTitle className="truncate text-base">
                                                    {outcome.placement?.intern?.full_name ?? 'Intern'}
                                                </CardTitle>
                                                <CardDescription className="truncate">
                                                    {outcome.placement?.programme?.name ?? 'Programme'}
                                                </CardDescription>
                                            </div>
                                            <StatusBadge status={outcome.completion_status} />
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Completion requirements</span>
                                                <span className="tabular-nums">
                                                    {progress.met} of {progress.total}
                                                </span>
                                            </div>
                                            <Progress value={progress.percent} className="mt-2 h-1.5" />
                                        </div>

                                        {outcome.final_score != null && (
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Final score
                                                </p>
                                                <p className="mt-1 text-sm tabular-nums">{formatScore(outcome.final_score)}</p>
                                            </div>
                                        )}

                                        {outcome.mentor_recommendation !== 'none' && (
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Recommended next step
                                                </p>
                                                <Badge variant="secondary" className="mt-1.5">
                                                    {humanise(outcome.mentor_recommendation)}
                                                </Badge>
                                            </div>
                                        )}

                                        {outcome.strengths && (
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Strengths
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                    {outcome.strengths}
                                                </p>
                                            </div>
                                        )}

                                        {certificate ? (
                                            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/5 p-3 text-sm">
                                                <Award className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                                                <span>
                                                    Certificate {certificate.certificate_number} issued{' '}
                                                    {formatDate(certificate.issued_at)}
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">
                                                No certificate issued yet
                                                {progress.total > 0 && progress.met < progress.total
                                                    ? ' — outstanding requirements must be met first.'
                                                    : '.'}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </Section>
        </div>
    );
}
