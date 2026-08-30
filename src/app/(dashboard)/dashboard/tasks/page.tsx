import { ListChecks } from 'lucide-react';
import { can, ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { listTasks } from '@/lib/data/work';
import { listOpenProgrammes } from '@/lib/data/programmes';
import { PageHeader } from '@/components/primitives/page-header';
import { FilterBar } from '@/components/primitives/filter-bar';
import { EmptyState, Section } from '@/components/primitives/states';
import { TaskBoard } from '@/components/work/task-board';
import { CreateTaskDialog } from '@/components/work/create-task-dialog';

export const metadata = { title: 'Delivery board · ITEK Internship OS' };

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

export default async function TasksPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; priority?: string }>;
}) {
    const session = await requireRole([...ROLE_GROUPS.staff, ...ROLE_GROUPS.participants], '/dashboard/tasks');
    const params = await searchParams;
    const canAssign = can(session.role, 'task:assign');

    const [tasks, programmes] = await Promise.all([
        listTasks({
            search: params.q,
            priority: PRIORITIES.includes(params.priority as never)
                ? (params.priority as (typeof PRIORITIES)[number])
                : undefined,
        }),
        canAssign ? listOpenProgrammes() : Promise.resolve([]),
    ]);

    return (
        <div className="mx-auto max-w-[1400px] space-y-7">
            <PageHeader
                eyebrow="Workspace"
                title="Delivery board"
                description="Tasks connect objectives, projects, competencies, evidence and review. What you can move depends on whether you are delivering the work or reviewing it."
                icon={ListChecks}
                actions={canAssign ? <CreateTaskDialog programmes={programmes} /> : undefined}
            />

            <FilterBar
                searchPlaceholder="Search tasks…"
                filters={[{ param: 'priority', label: 'Priority', options: PRIORITIES }]}
            />

            <Section error={tasks.error} schemaMissing={tasks.schemaMissing}>
                {tasks.data.rows.length === 0 ? (
                    <EmptyState
                        icon={ListChecks}
                        title="No tasks yet"
                        description={
                            canAssign
                                ? 'Create a task and assign it to a placement to start the delivery record.'
                                : 'Work assigned to you will appear here.'
                        }
                    />
                ) : (
                    <TaskBoard tasks={tasks.data.rows} canReview={can(session.role, 'task:review')} />
                )}
            </Section>
        </div>
    );
}
