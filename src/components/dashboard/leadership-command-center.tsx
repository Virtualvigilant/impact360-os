import Link from 'next/link';
import { AlertTriangle, Activity, ShieldAlert, Sparkles, UsersRound } from 'lucide-react';
import type { LeadershipDashboard } from '@/lib/data/command-center';
import { formatPercent, formatScore, pluralise } from '@/lib/utils/format';
import { StatGrid, type Stat } from '@/components/primitives/stat-card';
import { StatusBadge } from '@/components/primitives/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function LeadershipCommandCenter({ data }: { data: LeadershipDashboard }) {
    const activeInterns = data.health.reduce((sum, programme) => sum + programme.active_interns, 0);
    const overloaded = data.mentorLoad.filter((mentor) => mentor.active_interns >= 6);

    const stats: Stat[] = [
        { label: 'Active interns', value: activeInterns, helper: `Across ${pluralise(data.health.length, 'programme')}`, icon: Sparkles, href: '/dashboard/people' },
        {
            label: 'At risk',
            value: data.atRiskInterns.length,
            helper: data.atRiskInterns.length > 0 ? 'High or critical' : 'None flagged',
            icon: AlertTriangle,
            href: '/dashboard/people?risk=high',
            tone: data.atRiskInterns.length > 0 ? 'danger' : 'success',
        },
        {
            label: 'Open concerns',
            value: data.openConcerns,
            helper: data.openConcerns > 0 ? 'Awaiting triage' : 'Nothing outstanding',
            icon: ShieldAlert,
            href: '/dashboard/operations',
            tone: data.openConcerns > 0 ? 'warning' : 'success',
        },
        {
            label: 'Supervision load',
            value: overloaded.length,
            helper: overloaded.length > 0 ? 'Mentors at six or more' : 'Load is balanced',
            icon: UsersRound,
            href: '/dashboard/mentors',
            tone: overloaded.length > 0 ? 'warning' : 'success',
        },
    ];

    return (
        <div className="space-y-7">
            <StatGrid stats={stats} />

            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>Programme health</CardTitle>
                        <CardDescription>
                            Every figure is computed from source records, so it can be traced back to the placements and
                            evaluations behind it.
                        </CardDescription>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/dashboard/intelligence">Full view</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {data.health.length === 0 ? (
                        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                            No programmes created yet.
                        </p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {data.health.map((programme) => {
                                const total = programme.active_interns + programme.completed_interns;
                                const completion = total === 0 ? 0 : Math.round((programme.completed_interns / total) * 100);
                                return (
                                    <div key={programme.programme_id} className="rounded-xl border p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold">{programme.name}</p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {programme.cohort_label || 'No cohort label'}
                                                </p>
                                            </div>
                                            <StatusBadge status={programme.status} />
                                        </div>
                                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                            <Figure label="Active" value={programme.active_interns} />
                                            <Figure label="Done" value={programme.completed_interns} />
                                            <Figure label="At risk" value={programme.at_risk_interns} danger={programme.at_risk_interns > 0} />
                                        </div>
                                        <Progress value={completion} className="mt-4 h-1.5" />
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {formatPercent(completion)} completed · mean score {formatScore(programme.average_score)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Supervision capacity</CardTitle>
                        <CardDescription>Check load before assigning the next intern.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.mentorLoad.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No mentors assigned yet.</p>
                        ) : (
                            <ul className="divide-y">
                                {data.mentorLoad.slice(0, 6).map((mentor) => (
                                    <li key={mentor.mentor_id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{mentor.full_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {pluralise(mentor.check_ins_waiting, 'check-in')} waiting
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 gap-6 text-right">
                                            <Figure label="Interns" value={mentor.active_interns} />
                                            <Figure label="At risk" value={mentor.high_risk_interns} danger={mentor.high_risk_interns > 0} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Interns at risk</CardTitle>
                            <CardDescription>Where an intervention would matter most.</CardDescription>
                        </div>
                        <Activity className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </CardHeader>
                    <CardContent>
                        {data.atRiskInterns.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nobody is currently flagged high or critical.</p>
                        ) : (
                            <ul className="divide-y">
                                {data.atRiskInterns.slice(0, 6).map((intern) => (
                                    <li key={intern.placement_id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/dashboard/people/${intern.placement_id}`}
                                                className="truncate text-sm font-medium underline-offset-4 hover:underline"
                                            >
                                                {intern.full_name}
                                            </Link>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {intern.programme_name || 'Programme pending'} · attendance{' '}
                                                {formatPercent(intern.attendance_rate)}
                                            </p>
                                        </div>
                                        <StatusBadge status={intern.risk_level} />
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

function Figure({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) {
    return (
        <div>
            <p className={`text-lg font-semibold tabular-nums ${danger ? 'text-destructive' : ''}`}>{value}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        </div>
    );
}
