import { CalendarDays, Clock3, FileCheck2, Laptop, ShieldAlert, ShieldCheck, Wallet } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { attendanceRate, getOperationsBoard } from '@/lib/data/operations';
import { formatDate, formatDateRange, formatPercent, humanise } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { StatGrid, type Stat } from '@/components/primitives/stat-card';
import { StatusBadge } from '@/components/primitives/status-badge';
import { Section } from '@/components/primitives/states';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Operations · ITEK Internship OS' };

export default async function OperationsPage() {
    await requireRole([...ROLE_GROUPS.supervision, ...ROLE_GROUPS.participants], '/dashboard/operations');
    const { data, error, schemaMissing } = await getOperationsBoard();

    const rate = attendanceRate(data.attendance);
    const pendingLeave = data.leave.filter((request) => request.status === 'pending');
    const documentsNeedingAttention = data.documents.filter((document) =>
        ['required', 'rejected', 'expired'].includes(document.status),
    );
    const openConcerns = data.concerns.length;
    const issuedAssets = data.assets.filter((assignment) => assignment.status === 'issued');
    const activeAccess = data.access.filter((assignment) => assignment.status === 'provisioned');

    const stats: Stat[] = [
        {
            label: 'Attendance',
            value: formatPercent(rate, 'No records'),
            helper: `${data.attendance.length} records, last 90 days`,
            icon: Clock3,
        },
        {
            label: 'Leave requests',
            value: pendingLeave.length,
            helper: pendingLeave.length > 0 ? 'Awaiting a decision' : 'Nothing pending',
            icon: CalendarDays,
            tone: pendingLeave.length > 0 ? 'warning' : 'success',
        },
        {
            label: 'Documents',
            value: documentsNeedingAttention.length,
            helper: documentsNeedingAttention.length > 0 ? 'Missing, rejected or expired' : 'All in order',
            icon: FileCheck2,
            tone: documentsNeedingAttention.length > 0 ? 'warning' : 'success',
        },
        {
            label: 'Open concerns',
            value: openConcerns,
            helper: openConcerns > 0 ? 'Need triage' : 'None outstanding',
            icon: ShieldAlert,
            tone: openConcerns > 0 ? 'danger' : 'success',
        },
    ];

    return (
        <div className="mx-auto max-w-6xl space-y-7">
            <PageHeader
                eyebrow="Operations"
                title="Programme operations"
                description="Attendance, leave, documents, assets, access and stipends — each an accountable workflow with a named decision-maker rather than a spreadsheet."
                icon={ShieldCheck}
            />

            <Section error={error} schemaMissing={schemaMissing}>
                <div className="space-y-7">
                    <StatGrid stats={stats} />

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Leave requests</CardTitle>
                                <CardDescription>Pending first.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data.leave.length === 0 ? (
                                    <Muted>No leave requested.</Muted>
                                ) : (
                                    <ul className="divide-y">
                                        {data.leave.slice(0, 8).map((request) => (
                                            <li key={request.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {request.placement?.intern?.full_name ?? 'Intern'} ·{' '}
                                                        {request.leave_type}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDateRange(request.start_date, request.end_date)}
                                                    </p>
                                                </div>
                                                <StatusBadge status={request.status} />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Documents</CardTitle>
                                <CardDescription>Required paperwork and its state.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data.documents.length === 0 ? (
                                    <Muted>No documents tracked.</Muted>
                                ) : (
                                    <ul className="divide-y">
                                        {data.documents.slice(0, 8).map((document) => (
                                            <li key={document.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{document.document_type}</p>
                                                    {document.expires_at && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Expires {formatDate(document.expires_at)}
                                                        </p>
                                                    )}
                                                </div>
                                                <StatusBadge status={document.status} />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Assets</CardTitle>
                                <CardDescription>
                                    {issuedAssets.length} currently issued. Everything ITEK lends is tracked back to a person.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data.assets.length === 0 ? (
                                    <Muted>No assets assigned.</Muted>
                                ) : (
                                    <ul className="divide-y">
                                        {data.assets.slice(0, 6).map((assignment) => (
                                            <li key={assignment.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                                <Laptop className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {assignment.asset?.name ?? 'Asset'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {humanise(assignment.asset?.category)}
                                                    </p>
                                                </div>
                                                <StatusBadge status={assignment.status} />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>System access</CardTitle>
                                <CardDescription>
                                    {activeAccess.length} active grants. Access should end when a placement does.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data.access.length === 0 ? (
                                    <Muted>No access granted.</Muted>
                                ) : (
                                    <ul className="divide-y">
                                        {data.access.slice(0, 6).map((assignment) => (
                                            <li key={assignment.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {assignment.resource?.name ?? 'Resource'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {assignment.access_level ?? 'Standard access'}
                                                        {assignment.revoke_by ? ` · revoke by ${formatDate(assignment.revoke_by)}` : ''}
                                                    </p>
                                                </div>
                                                <StatusBadge status={assignment.status} />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {data.stipends.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Stipends</CardTitle>
                                <CardDescription>Payment periods and their state.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="divide-y">
                                    {data.stipends.slice(0, 8).map((payment) => (
                                        <li key={payment.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                            <Wallet className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium">
                                                    {formatDateRange(payment.period_start, payment.period_end)}
                                                </p>
                                            </div>
                                            <span className="text-sm tabular-nums">
                                                {payment.currency} {Number(payment.amount).toLocaleString('en-KE')}
                                            </span>
                                            <StatusBadge status={payment.status} />
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </Section>
        </div>
    );
}

function Muted({ children }: { children: React.ReactNode }) {
    return <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</p>;
}
