import { notFound } from 'next/navigation';
import { Code2, ExternalLink, FolderKanban, Globe } from 'lucide-react';
import { can, ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { getProject, listAvailableInterns } from '@/lib/data/work';
import { formatDate, formatDateRange, humanise } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { StatusBadge } from '@/components/primitives/status-badge';
import { BackLink, Section } from '@/components/primitives/states';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AssignMemberDialog } from '@/components/work/assign-member-dialog';
import { ProjectProgressDialog } from '@/components/work/project-progress-dialog';
import { RemoveMemberButton } from '@/components/work/remove-member-button';

export const metadata = { title: 'Project · ITEK Internship OS' };

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
    const session = await requireRole([...ROLE_GROUPS.staff, ...ROLE_GROUPS.participants]);
    const { projectId } = await params;
    const [projectResult, internsResult] = await Promise.all([
        getProject(projectId),
        listAvailableInterns(projectId),
    ]);
    const { data, error, schemaMissing } = projectResult;
    const availableInterns = internsResult.data ?? [];
    const canManage = can(session.role, 'project:manage');
    const isMember = (data?.members ?? []).some(
        (m) => m.placement?.intern?.id === session.userId,
    );
    const canUpdate = canManage || isMember;

    if (!error && !schemaMissing && !data) notFound();

    return (
        <div className="mx-auto max-w-5xl space-y-7">
            <BackLink href="/dashboard/projects" label="All projects" />

            <Section error={error} schemaMissing={schemaMissing}>
                {data && (
                    <>
                        <PageHeader
                            eyebrow={data.project.programme?.name ?? 'Independent project'}
                            title={data.project.name}
                            description={data.project.objective}
                            icon={FolderKanban}
                            actions={<StatusBadge status={data.project.status} />}
                        />

                        <Card>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                <div>
                                    <CardTitle>Delivery & Progress</CardTitle>
                                    <CardDescription>
                                        {data.project.code} · {formatDateRange(data.project.start_date, data.project.target_end_date)}
                                        {data.project.lead ? ` · led by ${data.project.lead.full_name}` : ''}
                                    </CardDescription>
                                </div>
                                {canUpdate && <ProjectProgressDialog project={data.project} />}
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <Progress value={data.project.progress} className="h-2 flex-1" />
                                    <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums">
                                        {data.project.progress}%
                                    </span>
                                </div>

                                {(data.project.repository_url || data.project.deployed_url) && (
                                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3">
                                        <span className="text-xs font-semibold text-muted-foreground">Deliverables:</span>
                                        {data.project.repository_url && (
                                            <a
                                                href={data.project.repository_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted hover:border-primary/40"
                                            >
                                                <Code2 className="h-3.5 w-3.5 text-primary" />
                                                GitHub Repository
                                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                            </a>
                                        )}
                                        {data.project.deployed_url && (
                                            <a
                                                href={data.project.deployed_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted hover:border-primary/40"
                                            >
                                                <Globe className="h-3.5 w-3.5 text-primary" />
                                                Live Site / Demo
                                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                            </a>
                                        )}
                                    </div>
                                )}

                                {data.project.description && (
                                    <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                                        {data.project.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>


                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                    <div>
                                        <CardTitle>Team</CardTitle>
                                        <CardDescription>
                                            Membership belongs to a placement, so it ends when the internship does.
                                        </CardDescription>
                                    </div>
                                    {canManage && (
                                        <AssignMemberDialog projectId={data.project.id} interns={availableInterns} />
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {data.members.length === 0 ? (
                                        <Muted>No one assigned yet.</Muted>
                                    ) : (
                                        <ul className="divide-y">
                                            {data.members.map((member) => (
                                                <li
                                                    key={`${member.project_id}-${member.placement_id}`}
                                                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">
                                                            {member.placement?.intern?.full_name ?? 'Team member'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {member.role_title ?? 'Contributor'}
                                                            {member.allocation_percent
                                                                ? ` · ${member.allocation_percent}% allocated`
                                                                : ''}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {member.left_at && <StatusBadge status="completed" />}
                                                        {canManage && (
                                                            <RemoveMemberButton
                                                                projectId={member.project_id}
                                                                placementId={member.placement_id}
                                                                memberName={member.placement?.intern?.full_name ?? 'this member'}
                                                            />
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>


                            <Card>
                                <CardHeader>
                                    <CardTitle>Milestones</CardTitle>
                                    <CardDescription>By due date.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {data.milestones.length === 0 ? (
                                        <Muted>No milestones set.</Muted>
                                    ) : (
                                        <ul className="divide-y">
                                            {data.milestones.map((milestone) => (
                                                <li key={milestone.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">{milestone.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {milestone.due_date ? formatDate(milestone.due_date) : 'No date'}
                                                        </p>
                                                    </div>
                                                    <StatusBadge status={milestone.status} />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tasks</CardTitle>
                                <CardDescription>All work assigned against this project.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data.tasks.length === 0 ? (
                                    <Muted>No tasks yet.</Muted>
                                ) : (
                                    <ul className="divide-y">
                                        {data.tasks.map((task) => (
                                            <li key={task.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{task.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {task.task_number} · {humanise(task.priority)}
                                                        {task.placement?.intern ? ` · ${task.placement.intern.full_name}` : ''}
                                                    </p>
                                                </div>
                                                <StatusBadge status={task.status} />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </Section>
        </div>
    );
}

function Muted({ children }: { children: React.ReactNode }) {
    return <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</p>;
}
