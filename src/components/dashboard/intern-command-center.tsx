import Link from 'next/link';
import {
    BookOpenCheck,
    CalendarDays,
    FileWarning,
    ListChecks,
    MessageSquareText,
    Target,
    TrendingUp,
} from 'lucide-react';
import type { InternDashboard } from '@/lib/data/command-center';
import { formatDate, formatPercent, formatRelativeTime, isOverdue, pluralise } from '@/lib/utils/format';
import { StatGrid, type Stat } from '@/components/primitives/stat-card';
import { StatusBadge } from '@/components/primitives/status-badge';
import { EmptyState } from '@/components/primitives/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function InternCommandCenter({ data, name }: { data: InternDashboard; name: string }) {
    if (!data.placement) {
        return (
            <EmptyState
                icon={BookOpenCheck}
                title="No active placement yet"
                description={`Your account is ready, ${name.split(' ')[0] || 'there'}, but you are not yet placed on a programme. Apply to an open opportunity and ITEK will connect an accepted application to this account.`}
                action={
                    <Button asChild>
                        <Link href="/opportunities">Browse open opportunities</Link>
                    </Button>
                }
            />
        );
    }

    const overdue = data.tasks.filter((task) => isOverdue(task.due_at)).length;
    const goalsAtRisk = data.goals.filter((goal) => goal.status === 'at_risk').length;

    const stats: Stat[] = [
        {
            label: 'Open tasks',
            value: data.tasks.length,
            helper: overdue > 0 ? `${pluralise(overdue, 'is', 'are')} overdue` : 'Nothing overdue',
            icon: ListChecks,
            href: '/dashboard/work',
            tone: overdue > 0 ? 'danger' : 'default',
        },
        {
            label: 'Learning progress',
            value: formatPercent(data.summary?.learning_progress ?? 0),
            helper: goalsAtRisk > 0 ? `${pluralise(goalsAtRisk, 'goal')} at risk` : `${pluralise(data.goals.length, 'goal')} set`,
            icon: Target,
            href: '/dashboard/development',
            tone: goalsAtRisk > 0 ? 'warning' : 'default',
        },
        {
            label: 'Attendance',
            value: formatPercent(data.summary?.attendance_rate ?? null, 'Not recorded'),
            helper: 'Across your placement so far',
            icon: TrendingUp,
            href: '/dashboard/operations',
        },
        {
            label: 'Documents',
            value: data.documentsOutstanding,
            helper: data.documentsOutstanding === 0 ? 'All up to date' : 'Need your attention',
            icon: FileWarning,
            href: '/dashboard/operations',
            tone: data.documentsOutstanding > 0 ? 'warning' : 'success',
        },
    ];

    return (
        <div className="space-y-7">
            <StatGrid stats={stats} />

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Your delivery queue</CardTitle>
                            <CardDescription>Ordered by what is due next.</CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/dashboard/work">Open workspace</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {data.tasks.length === 0 ? (
                            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                Nothing assigned right now. Your supervisor will add work as projects begin.
                            </p>
                        ) : (
                            <ul className="divide-y">
                                {data.tasks.slice(0, 6).map((task) => (
                                    <li key={task.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{task.title}</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {task.task_number}
                                                {task.due_at && (
                                                    <>
                                                        {' · '}
                                                        <span className={isOverdue(task.due_at) ? 'font-medium text-destructive' : ''}>
                                                            due {formatRelativeTime(task.due_at)}
                                                        </span>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                        <StatusBadge status={task.status} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>This week</CardTitle>
                        <CardDescription>Your check-in rhythm.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.latestCheckIn ? (
                            <div className="rounded-xl border p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(data.latestCheckIn.period_start)} – {formatDate(data.latestCheckIn.period_end)}
                                    </p>
                                    <StatusBadge status={data.latestCheckIn.status} />
                                </div>
                                {data.latestCheckIn.mentor_feedback ? (
                                    <p className="mt-3 text-sm leading-6">{data.latestCheckIn.mentor_feedback}</p>
                                ) : (
                                    <p className="mt-3 text-sm text-muted-foreground">Awaiting your mentor&rsquo;s review.</p>
                                )}
                            </div>
                        ) : (
                            <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                                You have not submitted a check-in yet. It is the main way your mentor learns what is
                                blocking you.
                            </p>
                        )}
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/dashboard/check-ins">
                                <MessageSquareText className="mr-2 h-4 w-4" aria-hidden />
                                Weekly check-in
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Learning goals</CardTitle>
                        <CardDescription>What you are becoming, not only what you finished.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.goals.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No goals set yet — agree these with your mentor.</p>
                        ) : (
                            data.goals.slice(0, 5).map((goal) => (
                                <div key={goal.id}>
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="truncate text-sm font-medium">{goal.title}</p>
                                        <StatusBadge status={goal.status} />
                                    </div>
                                    <Progress value={goal.progress} className="mt-2 h-1.5" />
                                    <p className="mt-1.5 text-xs text-muted-foreground">
                                        {goal.progress}% · {goal.target_date ? `target ${formatDate(goal.target_date)}` : 'no target date'}
                                    </p>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent feedback</CardTitle>
                        <CardDescription>Specific, attributable and yours to act on.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.feedback.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No feedback recorded yet.</p>
                        ) : (
                            data.feedback.slice(0, 3).map((entry) => (
                                <div key={entry.id} className="rounded-xl border p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <Badge variant="secondary" className="capitalize">
                                            {entry.source.replaceAll('_', ' ')}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{formatRelativeTime(entry.created_at)}</span>
                                    </div>
                                    {entry.strengths && <p className="mt-2.5 text-sm leading-6">{entry.strengths}</p>}
                                    {entry.next_action && (
                                        <p className="mt-2 text-xs text-muted-foreground">Next: {entry.next_action}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {data.events.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Coming up</CardTitle>
                        <CardDescription>Workshops, reviews and deadlines in the next month.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y">
                            {data.events.map((event) => (
                                <li key={event.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                    <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{event.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(event.starts_at)} · {event.location_or_link || 'Location to be confirmed'}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {formatRelativeTime(event.starts_at)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
