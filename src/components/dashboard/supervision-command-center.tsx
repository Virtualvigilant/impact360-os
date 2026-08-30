import Link from 'next/link';
import { AlertTriangle, CalendarDays, ClipboardCheck, GraduationCap, MessageSquareText } from 'lucide-react';
import type { SupervisionDashboard } from '@/lib/data/command-center';
import { formatDate, formatPercent, formatRelativeTime, pluralise } from '@/lib/utils/format';
import { StatGrid, type Stat } from '@/components/primitives/stat-card';
import { StatusBadge } from '@/components/primitives/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SupervisionCommandCenter({ data }: { data: SupervisionDashboard }) {
    const atRisk = data.interns.filter((intern) => intern.risk_level === 'high' || intern.risk_level === 'critical');

    const stats: Stat[] = [
        { label: 'Interns you supervise', value: data.interns.length, helper: 'Active placements', icon: GraduationCap, href: '/dashboard/people' },
        {
            label: 'Check-ins to review',
            value: data.checkInsAwaitingReview,
            helper: data.checkInsAwaitingReview > 0 ? 'Waiting on you' : 'All caught up',
            icon: MessageSquareText,
            href: '/dashboard/check-ins',
            tone: data.checkInsAwaitingReview > 0 ? 'warning' : 'success',
        },
        {
            label: 'Work to review',
            value: data.tasksAwaitingReview,
            helper: data.tasksAwaitingReview > 0 ? 'Submitted or in review' : 'Nothing pending',
            icon: ClipboardCheck,
            href: '/dashboard/tasks',
            tone: data.tasksAwaitingReview > 0 ? 'warning' : 'success',
        },
        {
            label: 'Interns at risk',
            value: atRisk.length,
            helper: atRisk.length > 0 ? 'Need an intervention' : 'None flagged',
            icon: AlertTriangle,
            href: '/dashboard/people?risk=high',
            tone: atRisk.length > 0 ? 'danger' : 'success',
        },
    ];

    return (
        <div className="space-y-7">
            <StatGrid stats={stats} />

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Who needs attention first</CardTitle>
                            <CardDescription>Sorted by risk, then name. Risk is derived, not assigned by hand.</CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/dashboard/people">All interns</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {data.interns.length === 0 ? (
                            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                No interns are assigned to you yet.
                            </p>
                        ) : (
                            <ul className="divide-y">
                                {data.interns.slice(0, 8).map((intern) => (
                                    <li key={intern.placement_id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/dashboard/people/${intern.placement_id}`}
                                                className="truncate text-sm font-medium underline-offset-4 hover:underline"
                                            >
                                                {intern.full_name}
                                            </Link>
                                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                {intern.track_name || 'Track pending'} · {intern.current_phase || 'Phase pending'}
                                            </p>
                                        </div>
                                        <div className="hidden shrink-0 gap-6 text-right sm:flex">
                                            <Metric label="Learning" value={formatPercent(intern.learning_progress)} />
                                            <Metric label="Attendance" value={formatPercent(intern.attendance_rate)} />
                                            <Metric label="Open" value={intern.open_tasks} />
                                        </div>
                                        <StatusBadge status={intern.risk_level} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Open risk signals</CardTitle>
                        <CardDescription>Each one states the rule that fired.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {data.openRisks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No unresolved signals.</p>
                        ) : (
                            data.openRisks.slice(0, 5).map((risk) => (
                                <div key={risk.id} className="rounded-xl border p-3.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium capitalize">{risk.signal_type.replaceAll('_', ' ')}</p>
                                        <StatusBadge status={risk.level} />
                                    </div>
                                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{risk.reason}</p>
                                    <p className="mt-1.5 text-[11px] text-muted-foreground/80">
                                        {formatRelativeTime(risk.detected_at)}
                                    </p>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {data.events.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Programme calendar</CardTitle>
                        <CardDescription>{pluralise(data.events.length, 'event')} in the next month.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y">
                            {data.events.map((event) => (
                                <li key={event.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                    <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{event.title}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(event.starts_at)}</p>
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

function Metric({ label, value }: { label: string; value: string | number }) {
    return (
        <div>
            <p className="text-sm font-medium tabular-nums">{value}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        </div>
    );
}
