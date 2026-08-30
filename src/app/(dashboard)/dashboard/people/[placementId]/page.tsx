import { notFound } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { getInternRecord } from '@/lib/data/interns';
import { attendanceRate } from '@/lib/data/operations';
import { formatDate, formatDateRange, formatHours, formatPercent, formatRelativeTime, formatScore } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { StatusBadge } from '@/components/primitives/status-badge';
import { BackLink, Section } from '@/components/primitives/states';
import { StatGrid, type Stat } from '@/components/primitives/stat-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, ClipboardCheck, ListChecks, Target } from 'lucide-react';

export const metadata = { title: 'Intern record · ITEK Internship OS' };

/**
 * One intern's full record.
 *
 * The governing question the product is built around — who is this person, what did
 * they do, what evidence exists, what feedback did they get, what changed — is answered
 * on this page or nowhere.
 */
export default async function InternRecordPage({ params }: { params: Promise<{ placementId: string }> }) {
    await requireRole(ROLE_GROUPS.staff);
    const { placementId } = await params;
    const { data, error, schemaMissing } = await getInternRecord(placementId);

    if (!error && !schemaMissing && !data) notFound();

    return (
        <div className="mx-auto max-w-6xl space-y-7">
            <BackLink href="/dashboard/people" label="All interns" />

            <Section error={error} schemaMissing={schemaMissing}>
                {data && <Record data={data} />}
            </Section>
        </div>
    );
}

function Record({ data }: { data: NonNullable<Awaited<ReturnType<typeof getInternRecord>>['data']> }) {
    const { summary, placement, goals, tasks, checkIns, feedback, evaluations, attendance, documents, risks } = data;

    const openTasks = tasks.filter((task) => !['completed', 'cancelled'].includes(task.status));
    const rate = attendanceRate(attendance);

    const stats: Stat[] = [
        { label: 'Learning progress', value: formatPercent(summary.learning_progress), helper: `${goals.length} goals`, icon: Target },
        { label: 'Attendance', value: formatPercent(rate ?? summary.attendance_rate), helper: `${attendance.length} records`, icon: Activity },
        { label: 'Open tasks', value: openTasks.length, helper: `${summary.completed_tasks} completed`, icon: ListChecks },
        {
            label: 'Performance',
            value: formatScore(summary.performance_score, 5, 'Not scored'),
            helper: `${evaluations.length} evaluations`,
            icon: ClipboardCheck,
        },
    ];

    return (
        <>
            <PageHeader
                eyebrow={summary.programme_name || 'Placement'}
                title={summary.full_name}
                description={`${summary.track_name || 'Track pending'} · ${summary.current_phase || 'Phase pending'} · ${formatDateRange(summary.start_date, summary.end_date)}`}
                icon={GraduationCap}
                actions={
                    <>
                        <StatusBadge status={summary.status} />
                        <StatusBadge status={summary.risk_level} />
                    </>
                }
            />

            <StatGrid stats={stats} />

            {risks.length > 0 && (
                <Card className="border-destructive/40">
                    <CardHeader>
                        <CardTitle>Open risk signals</CardTitle>
                        <CardDescription>
                            Each signal states the rule that fired and the record it fired against, so it can be argued
                            with rather than merely obeyed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {risks.map((risk) => (
                            <div key={risk.id} className="rounded-xl border p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-medium capitalize">{risk.signal_type.replaceAll('_', ' ')}</p>
                                    <StatusBadge status={risk.level} />
                                </div>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">{risk.reason}</p>
                                <p className="mt-2 text-xs text-muted-foreground/80">
                                    Detected {formatRelativeTime(risk.detected_at)}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="work">
                <TabsList className="flex-wrap">
                    <TabsTrigger value="work">Work</TabsTrigger>
                    <TabsTrigger value="development">Development</TabsTrigger>
                    <TabsTrigger value="checkins">Check-ins</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="operations">Operations</TabsTrigger>
                </TabsList>

                <TabsContent value="work" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tasks</CardTitle>
                            <CardDescription>Delivery history, most urgent first.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tasks.length === 0 ? (
                                <Muted>No work assigned yet.</Muted>
                            ) : (
                                <ul className="divide-y">
                                    {tasks.map((task) => (
                                        <li key={task.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{task.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {task.task_number}
                                                    {task.due_at ? ` · due ${formatDate(task.due_at)}` : ''}
                                                </p>
                                            </div>
                                            <StatusBadge status={task.status} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="development" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Learning goals</CardTitle>
                            <CardDescription>Competency growth, measured against an agreed success measure.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {goals.length === 0 ? (
                                <Muted>No goals agreed yet.</Muted>
                            ) : (
                                goals.map((goal) => (
                                    <div key={goal.id}>
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="truncate text-sm font-medium">{goal.title}</p>
                                            <StatusBadge status={goal.status} />
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">{goal.success_measure}</p>
                                        <Progress value={goal.progress} className="mt-2 h-1.5" />
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Feedback</CardTitle>
                            <CardDescription>Multi-source, attributable and specific.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {feedback.length === 0 ? (
                                <Muted>No feedback recorded yet.</Muted>
                            ) : (
                                feedback.map((entry) => (
                                    <div key={entry.id} className="rounded-xl border p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <Badge variant="secondary" className="capitalize">
                                                {entry.source.replaceAll('_', ' ')}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {formatRelativeTime(entry.created_at)}
                                            </span>
                                        </div>
                                        {entry.strengths && <Field label="Strengths" value={entry.strengths} />}
                                        {entry.development_areas && <Field label="Development" value={entry.development_areas} />}
                                        {entry.next_action && <Field label="Next action" value={entry.next_action} />}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="checkins" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly check-ins</CardTitle>
                            <CardDescription>The narrative of the internship, week by week.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {checkIns.length === 0 ? (
                                <Muted>No check-ins submitted yet.</Muted>
                            ) : (
                                checkIns.map((entry) => (
                                    <div key={entry.id} className="rounded-xl border p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(entry.period_start)} – {formatDate(entry.period_end)}
                                            </p>
                                            <StatusBadge status={entry.status} />
                                        </div>
                                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                            <Field label="Achievements" value={entry.achievements} />
                                            <Field label="Learning" value={entry.learning} />
                                            <Field label="Blockers" value={entry.blockers} />
                                            <Field label="Next steps" value={entry.next_steps} />
                                        </div>
                                        {entry.mentor_feedback && (
                                            <div className="mt-4 rounded-lg bg-primary/5 p-3.5">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                                    Mentor feedback
                                                </p>
                                                <p className="mt-1.5 text-sm leading-6">{entry.mentor_feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Evaluations</CardTitle>
                            <CardDescription>Rubric-based assessment across the placement.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {evaluations.length === 0 ? (
                                <Muted>No evaluations recorded yet.</Muted>
                            ) : (
                                <ul className="divide-y">
                                    {evaluations.map((evaluation) => (
                                        <li key={evaluation.id} className="py-4 first:pt-0 last:pb-0">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-medium capitalize">
                                                    {evaluation.evaluation_type.replaceAll('_', ' ')} evaluation
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm tabular-nums">
                                                        {formatScore(evaluation.overall_score)}
                                                    </span>
                                                    <StatusBadge status={evaluation.status} />
                                                </div>
                                            </div>
                                            {evaluation.strengths && <Field label="Strengths" value={evaluation.strengths} />}
                                            {evaluation.development_areas && (
                                                <Field label="Development" value={evaluation.development_areas} />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="operations" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Placement</CardTitle>
                            <CardDescription>Named accountability for this internship.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <Field label="Dates" value={formatDateRange(placement?.start_date, placement?.end_date)} />
                            <Field label="Phase" value={summary.current_phase} />
                            <Field
                                label="Hours"
                                value={
                                    placement?.expected_hours
                                        ? `${formatHours(placement.hours_logged)} logged of ${formatHours(placement.expected_hours)}`
                                        : formatHours(placement?.hours_logged)
                                }
                            />
                            <Field label="Baseline notes" value={placement?.baseline_notes} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                            <CardDescription>Required paperwork and its current state.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {documents.length === 0 ? (
                                <Muted>No documents required.</Muted>
                            ) : (
                                <ul className="divide-y">
                                    {documents.map((document) => (
                                        <li key={document.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                                            <p className="truncate text-sm">{document.document_type}</p>
                                            <StatusBadge status={document.status} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm leading-6">{value || 'Not provided'}</p>
        </div>
    );
}

function Muted({ children }: { children: React.ReactNode }) {
    return <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</p>;
}
