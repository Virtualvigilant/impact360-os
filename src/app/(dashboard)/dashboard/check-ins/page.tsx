import { MessageSquareText } from 'lucide-react';
import { can, ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { listCheckIns } from '@/lib/data/development';
import { getOwnPlacement } from '@/lib/data/interns';
import { PageHeader } from '@/components/primitives/page-header';
import { Pagination } from '@/components/primitives/pagination';
import { EmptyState, Section } from '@/components/primitives/states';
import { CheckInCard } from '@/components/development/check-in-card';
import { SubmitCheckInDialog } from '@/components/development/submit-check-in-dialog';

export const metadata = { title: 'Check-ins · ITEK Internship OS' };

export default async function CheckInsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const session = await requireRole(
        [...ROLE_GROUPS.supervision, ...ROLE_GROUPS.participants],
        '/dashboard/check-ins',
    );
    const params = await searchParams;

    const canSubmit = can(session.role, 'checkin:submit');
    const canReview = can(session.role, 'checkin:review');

    const placement = canSubmit ? await getOwnPlacement(session.userId) : null;
    const checkIns = await listCheckIns({
        placementId: placement?.id,
        page: Number(params.page) || 1,
    });

    return (
        <div className="mx-auto max-w-4xl space-y-7">
            <PageHeader
                eyebrow="Development"
                title="Check-ins and feedback"
                description="A weekly rhythm covering achievement, learning, blockers, wellbeing and the support that is needed. This is where a mentor learns what is actually in the way."
                icon={MessageSquareText}
                actions={placement ? <SubmitCheckInDialog placementId={placement.id} /> : undefined}
            />

            <Section error={checkIns.error} schemaMissing={checkIns.schemaMissing}>
                {checkIns.data.rows.length === 0 ? (
                    <EmptyState
                        icon={MessageSquareText}
                        title="No check-ins yet"
                        description={
                            canSubmit
                                ? 'Submit your first weekly reflection. Being specific about blockers is what makes it useful.'
                                : 'Weekly reflections from the interns you supervise will appear here for review.'
                        }
                    />
                ) : (
                    <>
                        <div className="space-y-4">
                            {checkIns.data.rows.map((checkIn) => (
                                <CheckInCard key={checkIn.id} checkIn={checkIn} canReview={canReview} />
                            ))}
                        </div>
                        <Pagination page={checkIns.data} label="check-ins" />
                    </>
                )}
            </Section>
        </div>
    );
}
