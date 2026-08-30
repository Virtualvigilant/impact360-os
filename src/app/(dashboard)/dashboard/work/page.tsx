import { BriefcaseBusiness } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { getOwnPlacement } from '@/lib/data/interns';
import { listTasks } from '@/lib/data/work';
import { listLearningGoals } from '@/lib/data/development';
import { PageHeader } from '@/components/primitives/page-header';
import { EmptyState, Section } from '@/components/primitives/states';
import { TaskBoard } from '@/components/work/task-board';
import { AttachEvidenceDialog } from '@/components/work/attach-evidence-dialog';

export const metadata = { title: 'My work · ITEK Internship OS' };

/**
 * The intern's own workspace.
 *
 * Scoped by `placement_id` rather than by matching the intern's *name* against the
 * joined row, which is what the previous implementation did — two interns sharing a
 * name would have seen each other's work, and anyone whose profile name was edited
 * would have seen none of their own.
 */
export default async function MyWorkPage() {
    const session = await requireRole(ROLE_GROUPS.participants, '/dashboard/work');
    const placement = await getOwnPlacement(session.userId);

    if (!placement) {
        return (
            <div className="mx-auto max-w-5xl space-y-7">
                <PageHeader
                    eyebrow="Workspace"
                    title="My work"
                    description="Your projects, delivery queue and evidence."
                    icon={BriefcaseBusiness}
                />
                <EmptyState
                    title="No active placement"
                    description="Work appears here once ITEK connects an accepted application to your account and opens a placement."
                />
            </div>
        );
    }

    const [tasks, goals] = await Promise.all([
        listTasks({ placementId: placement.id }),
        listLearningGoals({ placementId: placement.id }),
    ]);

    return (
        <div className="mx-auto max-w-[1400px] space-y-7">
            <PageHeader
                eyebrow="Workspace"
                title="My work"
                description="Your delivery queue and the evidence behind it. Move a task forward when it is genuinely ready — your supervisor reviews, you do not self-approve."
                icon={BriefcaseBusiness}
                actions={<AttachEvidenceDialog placementId={placement.id} tasks={tasks.data.rows} />}
            />

            <Section error={tasks.error} schemaMissing={tasks.schemaMissing}>
                {tasks.data.rows.length === 0 ? (
                    <EmptyState
                        title="Nothing assigned yet"
                        description="Your supervisor will assign work as projects begin. In the meantime, agree your learning goals with your mentor."
                    />
                ) : (
                    <TaskBoard tasks={tasks.data.rows} canReview={false} />
                )}
            </Section>

            <Section error={goals.error} schemaMissing={goals.schemaMissing}>
                {goals.data.rows.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {goals.data.total} learning {goals.data.total === 1 ? 'goal' : 'goals'} tracked. Attach evidence to a
                        task to connect what you built to what you are learning.
                    </p>
                )}
            </Section>
        </div>
    );
}
