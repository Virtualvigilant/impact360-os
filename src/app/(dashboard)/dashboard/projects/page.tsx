import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { can, ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { listProjects } from '@/lib/data/work';
import { formatDate } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { FilterBar } from '@/components/primitives/filter-bar';
import { Pagination } from '@/components/primitives/pagination';
import { StatusBadge } from '@/components/primitives/status-badge';
import { EmptyState, Section } from '@/components/primitives/states';
import { CreateProjectDialog } from '@/components/work/create-project-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const metadata = { title: 'Projects · ITEK Internship OS' };

const STATUSES = ['planned', 'active', 'on_hold', 'completed', 'cancelled'] as const;

export default async function ProjectsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
    const session = await requireRole([...ROLE_GROUPS.staff, ...ROLE_GROUPS.participants], '/dashboard/projects');
    const params = await searchParams;

    const { data, error, schemaMissing } = await listProjects({
        search: params.q,
        status: STATUSES.includes(params.status as never) ? (params.status as (typeof STATUSES)[number]) : undefined,
        page: Number(params.page) || 1,
    });

    return (
        <div className="mx-auto max-w-6xl space-y-7">
            <PageHeader
                eyebrow="Workspace"
                title="Project workspaces"
                description="Objectives, teams, milestones and delivery health. Interns contribute to real work here, and the record of that contribution is what a certificate later refers to."
                icon={FolderKanban}
                actions={can(session.role, 'project:manage') ? <CreateProjectDialog /> : undefined}
            />

            <FilterBar
                searchPlaceholder="Search projects…"
                filters={[{ param: 'status', label: 'Status', options: STATUSES }]}
            />

            <Section error={error} schemaMissing={schemaMissing}>
                {data.rows.length === 0 ? (
                    <EmptyState
                        icon={FolderKanban}
                        title="No projects yet"
                        description="A project gives tasks their context. Create one so work can be assigned against something meaningful."
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2">
                            {data.rows.map((project) => (
                                <Card key={project.id} className="transition-colors hover:border-primary/40">
                                    <CardContent className="p-5">
                                        <Link href={`/dashboard/projects/${project.id}`} className="block">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold">{project.name}</p>
                                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                                        {project.code} · {project.programme?.name ?? 'Independent'} ·{' '}
                                                        {project.lead?.full_name ?? 'Lead pending'}
                                                    </p>
                                                </div>
                                                <StatusBadge status={project.status} />
                                            </div>

                                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                                {project.objective}
                                            </p>

                                            <div className="mt-4 flex items-center gap-3">
                                                <Progress value={project.progress} className="h-1.5 flex-1" />
                                                <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                                                    {project.progress}%
                                                </span>
                                            </div>

                                            {project.target_end_date && (
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Target {formatDate(project.target_end_date)}
                                                </p>
                                            )}
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <Pagination page={data} label="projects" />
                    </>
                )}
            </Section>
        </div>
    );
}
