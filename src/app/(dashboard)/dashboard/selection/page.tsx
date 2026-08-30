import { ClipboardCheck } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { getSelectionBoard } from '@/lib/data/applications';
import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { StatusBadge } from '@/components/primitives/status-badge';
import { EmptyState, Section } from '@/components/primitives/states';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Interviews and offers · ITEK Internship OS' };

export default async function SelectionPage() {
    await requireRole(ROLE_GROUPS.talentTeam, '/dashboard/selection');
    const { data, error, schemaMissing } = await getSelectionBoard();

    return (
        <div className="mx-auto max-w-5xl space-y-7">
            <PageHeader
                eyebrow="Talent pipeline"
                title="Interviews and offers"
                description="Structured scoring against the same criteria for every candidate, then a decision and an offer someone can accept or decline on the record."
                icon={ClipboardCheck}
            />

            <Section error={error} schemaMissing={schemaMissing}>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interviews</CardTitle>
                            <CardDescription>Most recent first.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.interviews.length === 0 ? (
                                <EmptyState
                                    icon={ClipboardCheck}
                                    title="No interviews"
                                    description="Schedule an interview from a shortlisted application."
                                />
                            ) : (
                                <ul className="divide-y">
                                    {data.interviews.map((interview) => (
                                        <li key={interview.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {interview.application?.full_name ?? 'Candidate'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {interview.interview_type} · {formatDateTime(interview.scheduled_at)}
                                                    {interview.application?.application_number
                                                        ? ` · ${interview.application.application_number}`
                                                        : ''}
                                                </p>
                                            </div>
                                            <StatusBadge status={interview.status} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Offers</CardTitle>
                            <CardDescription>Issued, accepted and declined.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.offers.length === 0 ? (
                                <EmptyState
                                    icon={ClipboardCheck}
                                    title="No offers"
                                    description="An offer follows a selection decision and names the programme, dates and arrangement."
                                />
                            ) : (
                                <ul className="divide-y">
                                    {data.offers.map((offer) => (
                                        <li key={offer.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {offer.application?.full_name ?? 'Candidate'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Starts {formatDate(offer.offered_start_date)}
                                                    {offer.responded_at
                                                        ? ` · responded ${formatRelativeTime(offer.responded_at)}`
                                                        : offer.expires_at
                                                          ? ` · expires ${formatDate(offer.expires_at)}`
                                                          : ''}
                                                </p>
                                            </div>
                                            <StatusBadge status={offer.status} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Section>
        </div>
    );
}
