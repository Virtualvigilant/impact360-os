import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Code2, ExternalLink, FolderKanban, Globe, GraduationCap } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { getInternRecord, type InternProject } from '@/lib/data/interns';
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
    const { summary, placement, goals, tasks, projects, checkIns, feedback, evaluations, attendance, documents, risks } = data;

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

            <Tabs defaultValue="projects">
                <TabsList className="flex-wrap">
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="work">Work</TabsTrigger>
                    <TabsTrigger value="development">Development</TabsTrigger>
                    <TabsTrigger value="checkins">Check-ins</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="operations">Operations</TabsTrigger>
                </TabsList>

                {/* ── Projects ─────────────────────────────────────────── */}
                <TabsContent value="projects" className="mt-6 space-y-6">
                    {projects.length === 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Assigned projects</CardTitle>
                                <CardDescription>
                                    Projects this intern has been assigned to as a team member.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Muted>No projects assigned yet.</Muted>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="flex items-center gap-3">
                                <FolderKanban className="h-5 w-5 text-primary" />
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        {projects.length} assigned project{projects.length !== 1 ? 's' : ''}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {projects.filter((p) => p.project.status === 'active').length} active ·{' '}
                                        {projects.filter((p) => p.project.status === 'completed').length} completed
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {projects.map((p) => (
                                    <ProjectCard key={p.project.id} data={p} tasks={tasks} />
                                ))}
                            </div>
                        </>
                    )}
                </TabsContent>

                {/* ── Work / Tasks ──────────────────────────────────────── */}
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

                {/* ── Development ──────────────────────────────────────── */}
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

                {/* ── Check-ins ────────────────────────────────────────── */}
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

                {/* ── Performance ──────────────────────────────────────── */}
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

                {/* ── Operations ───────────────────────────────────────── */}
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

/* ── Project Card Component ────────────────────────────────────────────── */

function ProjectCard({
    data: p,
    tasks,
}: {
    data: InternProject;
    tasks: { id: string; project_id: string | null; title: string; status: string; due_at: string | null; task_number: string }[];
}) {
    const projectTasks = tasks.filter((t) => t.project_id === p.project.id);

    return (
        <Card className="transition-colors hover:border-primary/40">
            <CardContent className="p-5">
                <Link href={`/dashboard/projects/${p.project.id}`} className="block">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{p.project.name}</p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {p.project.code} · {p.project.programme?.name ?? 'Independent'}
                            </p>
                        </div>
                        <StatusBadge status={p.project.status} />
                    </div>
                </Link>

                {/* Intern's role on this project */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[11px]">
                        {p.role_title ?? 'Contributor'}
                    </Badge>
                    {p.allocation_percent && (
                        <Badge variant="outline" className="text-[11px]">
                            {p.allocation_percent}% allocated
                        </Badge>
                    )}
                    {p.left_at && (
                        <Badge variant="destructive" className="text-[11px]">
                            Left {formatDate(p.left_at)}
                        </Badge>
                    )}
                </div>

                {/* Progress bar */}
                <div className="mt-3 flex items-center gap-3">
                    <Progress value={p.project.progress} className="h-1.5 flex-1" />
                    <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {p.project.progress}%
                    </span>
                </div>

                {/* Task summary */}
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{p.tasks_total} task{p.tasks_total !== 1 ? 's' : ''}</span>
                    <span>{p.tasks_open} open</span>
                    {p.project.target_end_date && (
                        <span>Target {formatDate(p.project.target_end_date)}</span>
                    )}
                </div>

                {/* Deliverables links */}
                {(p.project.repository_url || p.project.deployed_url) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {p.project.repository_url && (
                            <a
                                href={p.project.repository_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-muted/80"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Code2 className="h-3 w-3 text-muted-foreground" />
                                Repo
                                <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/60" />
                            </a>
                        )}
                        {p.project.deployed_url && (
                            <a
                                href={p.project.deployed_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-muted/80"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Globe className="h-3 w-3 text-emerald-500" />
                                Live site
                                <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/60" />
                            </a>
                        )}
                    </div>
                )}

                {/* Recent tasks on this project */}
                {projectTasks.length > 0 && (
                    <div className="mt-4 border-t pt-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Tasks on this project
                        </p>
                        <ul className="space-y-1.5">
                            {projectTasks.slice(0, 5).map((task) => (
                                <li key={task.id} className="flex items-center justify-between gap-2">
                                    <p className="truncate text-xs">{task.title}</p>
                                    <StatusBadge status={task.status} />
                                </li>
                            ))}
                            {projectTasks.length > 5 && (
                                <li className="text-xs text-muted-foreground">
                                    +{projectTasks.length - 5} more task{projectTasks.length - 5 !== 1 ? 's' : ''}
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/* ── Shared helpers ────────────────────────────────────────────────────── */

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
