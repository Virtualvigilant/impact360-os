import Link from 'next/link';
import { BriefcaseBusiness, CalendarClock, ClipboardCheck, UserRoundSearch } from 'lucide-react';
import type { TalentDashboard } from '@/lib/data/command-center';
import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/utils/format';
import { StatGrid, type Stat } from '@/components/primitives/stat-card';
import { StatusBadge } from '@/components/primitives/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function TalentCommandCenter({ data }: { data: TalentDashboard }) {
    const stats: Stat[] = [
        {
            label: 'Awaiting first review',
            value: data.submitted,
            helper: data.submitted > 0 ? 'Nobody has looked yet' : 'Queue is clear',
            icon: UserRoundSearch,
            href: '/dashboard/applications?status=submitted',
            tone: data.submitted > 0 ? 'warning' : 'success',
        },
        { label: 'Under review', value: data.inReview, helper: 'Being assessed', icon: ClipboardCheck, href: '/dashboard/applications?status=under_review' },
        { label: 'At interview', value: data.interviewing, helper: 'Scheduled or in progress', icon: CalendarClock, href: '/dashboard/selection' },
        { label: 'Selected', value: data.selected, helper: 'Ready for an offer', icon: BriefcaseBusiness, href: '/dashboard/applications?status=selected', tone: 'success' },
    ];

    return (
        <div className="space-y-7">
            <StatGrid stats={stats} />

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Upcoming interviews</CardTitle>
                            <CardDescription>Scheduled, soonest first.</CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/dashboard/selection">Manage</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {data.upcomingInterviews.length === 0 ? (
                            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                Nothing scheduled.
                            </p>
                        ) : (
                            <ul className="divide-y">
                                {data.upcomingInterviews.map((interview) => (
                                    <li key={interview.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {interview.application?.full_name ?? 'Candidate'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {interview.interview_type} · {formatDateTime(interview.scheduled_at)}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {formatRelativeTime(interview.scheduled_at)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Published opportunities</CardTitle>
                            <CardDescription>Live on the public catalogue.</CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/dashboard/opportunities">Manage</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {data.openOpportunities.length === 0 ? (
                            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                Nothing published. Applications cannot arrive until an opportunity is live.
                            </p>
                        ) : (
                            <ul className="divide-y">
                                {data.openOpportunities.map((opportunity) => (
                                    <li key={opportunity.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{opportunity.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {opportunity.slots} {opportunity.slots === 1 ? 'slot' : 'slots'}
                                                {opportunity.closes_at ? ` · closes ${formatDate(opportunity.closes_at)}` : ''}
                                            </p>
                                        </div>
                                        <StatusBadge status={opportunity.status} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
