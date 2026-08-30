import { UsersRound } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { listMentorCapacity } from '@/lib/data/interns';
import { pluralise } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { EmptyState, Section } from '@/components/primitives/states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Mentors and supervisors · ITEK Internship OS' };

/**
 * Supervision capacity.
 *
 * Six is the point at which weekly one-to-one check-ins stop fitting in a normal week
 * alongside the mentor's own delivery work, so it is where the interface starts saying
 * something rather than silently accepting a seventh assignment.
 */
const COMFORTABLE_LOAD = 5;

export default async function MentorsPage() {
    await requireRole(ROLE_GROUPS.programmeLeaders, '/dashboard/mentors');
    const { data, error, schemaMissing } = await listMentorCapacity();

    return (
        <div className="mx-auto max-w-4xl space-y-7">
            <PageHeader
                eyebrow="People"
                title="Mentors and supervisors"
                description="Make supervision load visible before assigning the next intern. A mentor carrying eight people is not mentoring eight people."
                icon={UsersRound}
            />

            <Section error={error} schemaMissing={schemaMissing}>
                {data.length === 0 ? (
                    <EmptyState
                        icon={UsersRound}
                        title="No supervision assigned"
                        description="Mentors and supervisors appear here once they are named on a placement."
                    />
                ) : (
                    <Card>
                        <CardContent className="divide-y p-0">
                            {data.map((mentor) => {
                                const stretched = mentor.active_interns > COMFORTABLE_LOAD;
                                return (
                                    <div key={mentor.mentor_id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">{mentor.full_name}</p>
                                            <p className="truncate text-xs text-muted-foreground">{mentor.email}</p>
                                            {mentor.check_ins_waiting > 0 && (
                                                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                                                    {pluralise(mentor.check_ins_waiting, 'check-in')} waiting for review
                                                </p>
                                            )}
                                        </div>

                                        <dl className="grid shrink-0 grid-cols-3 gap-6 text-right">
                                            <Figure label="Interns" value={mentor.active_interns} danger={stretched} />
                                            <Figure
                                                label="At risk"
                                                value={mentor.high_risk_interns}
                                                danger={mentor.high_risk_interns > 0}
                                            />
                                            <Figure label="Waiting" value={mentor.check_ins_waiting} />
                                        </dl>

                                        {stretched && (
                                            <Badge variant="outline" className="w-fit shrink-0 border-amber-500/40 text-amber-600 dark:text-amber-400">
                                                Stretched
                                            </Badge>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}
            </Section>
        </div>
    );
}

function Figure({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) {
    return (
        <div>
            <dd className={`text-sm font-medium tabular-nums ${danger ? 'text-destructive' : ''}`}>{value}</dd>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
        </div>
    );
}
