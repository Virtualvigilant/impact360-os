import { Target } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { listLearningGoals } from '@/lib/data/development';
import { formatDate } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { Pagination } from '@/components/primitives/pagination';
import { StatusBadge } from '@/components/primitives/status-badge';
import { EmptyState, Section } from '@/components/primitives/states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const metadata = { title: 'Learning and goals · ITEK Internship OS' };

export default async function DevelopmentPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    await requireRole([...ROLE_GROUPS.supervision, ...ROLE_GROUPS.participants], '/dashboard/development');
    const params = await searchParams;
    const { data, error, schemaMissing } = await listLearningGoals({ page: Number(params.page) || 1 });

    return (
        <div className="mx-auto max-w-5xl space-y-7">
            <PageHeader
                eyebrow="Development"
                title="Learning and goals"
                description="What each intern is becoming, not only what they have finished. Every goal names a competency and a success measure, so progress is something you can argue about with evidence."
                icon={Target}
            />

            <Section error={error} schemaMissing={schemaMissing}>
                {data.rows.length === 0 ? (
                    <EmptyState
                        icon={Target}
                        title="No learning goals yet"
                        description="Goals are agreed between an intern and their mentor at the start of a placement, and revisited at each check-in."
                    />
                ) : (
                    <>
                        <Card>
                            <CardContent className="divide-y p-0">
                                {data.rows.map((goal) => (
                                    <div key={goal.id} className="p-4">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold">{goal.title}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {goal.placement?.intern?.full_name ?? 'Intern'}
                                                    {goal.target_date ? ` · target ${formatDate(goal.target_date)}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {goal.competency && (
                                                    <Badge variant="secondary">{goal.competency.name}</Badge>
                                                )}
                                                <StatusBadge status={goal.status} />
                                            </div>
                                        </div>

                                        <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
                                            {goal.success_measure}
                                        </p>

                                        <div className="mt-3 flex items-center gap-3">
                                            <Progress value={goal.progress} className="h-1.5 flex-1" />
                                            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                                                {goal.progress}%
                                            </span>
                                        </div>

                                        {goal.mentor_notes && (
                                            <p className="mt-3 rounded-lg bg-muted/60 p-3 text-xs leading-5">
                                                <span className="font-semibold">Mentor: </span>
                                                {goal.mentor_notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Pagination page={data} label="goals" />
                    </>
                )}
            </Section>
        </div>
    );
}
