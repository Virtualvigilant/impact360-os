import { notFound } from 'next/navigation';
import { FolderKanban } from 'lucide-react';
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
                            <CardHeader>
                                <CardTitle>Delivery</CardTitle>
                                <CardDescription>
                                    {data.project.code} · {formatDateRange(data.project.start_date, data.project.target_end_date)}
                                    {data.project.lead ? ` · led by ${data.project.lead.full_name}` : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <Progress value={data.project.progress} className="h-2 flex-1" />
                                    <span className="w-12 shrink-0 text-right text-sm tabular-nums">
                                        {data.project.progress}%
                                    </span>
                                </div>
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
