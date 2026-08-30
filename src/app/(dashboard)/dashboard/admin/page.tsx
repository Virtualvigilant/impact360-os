import { Settings, ShieldCheck } from 'lucide-react';
import { ROLE_GROUPS, ROLE_LABELS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { getGovernanceBoard } from '@/lib/data/governance';
import { formatDate, formatRelativeTime, humanise } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { StatusBadge } from '@/components/primitives/status-badge';
import { Section } from '@/components/primitives/states';
import { RoleAssignment } from '@/components/governance/role-assignment';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata = { title: 'Governance · ITEK Internship OS' };

export default async function GovernancePage() {
    const session = await requireRole(ROLE_GROUPS.programmeLeaders, '/dashboard/admin');
    const { data, error, schemaMissing } = await getGovernanceBoard();

    return (
        <div className="mx-auto max-w-6xl space-y-7">
            <PageHeader
                eyebrow="Admin"
                title="Governance and settings"
                description="Roles, policies, privacy requests, retention and the accountability record. Everything on this page is designed to be shown to someone who is asking hard questions."
                icon={Settings}
            />

            <Section error={error} schemaMissing={schemaMissing}>
                <Tabs defaultValue="people">
                    <TabsList className="flex-wrap">
                        <TabsTrigger value="people">People and roles</TabsTrigger>
                        <TabsTrigger value="policies">Policies</TabsTrigger>
                        <TabsTrigger value="privacy">Privacy</TabsTrigger>
                        <TabsTrigger value="audit">Audit trail</TabsTrigger>
                    </TabsList>

                    <TabsContent value="people" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Accounts and roles</CardTitle>
                                <CardDescription>
                                    No account can grant itself a role. Every change goes through one audited function, and
                                    only a super administrator may create or remove another.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ul className="divide-y">
                                    {data.staff.map((person) => (
                                        <li key={person.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {person.full_name || person.email}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {person.email}
                                                    {person.last_seen_at ? ` · seen ${formatRelativeTime(person.last_seen_at)}` : ''}
                                                </p>
                                            </div>
                                            <Badge variant="secondary" className="w-fit shrink-0">
                                                {ROLE_LABELS[person.role]}
                                            </Badge>
                                            {!person.is_active && <Badge variant="outline">Inactive</Badge>}
                                            <RoleAssignment
                                                profileId={person.id}
                                                name={person.full_name || person.email}
                                                currentRole={person.role}
                                                isSelf={person.id === session.userId}
                                                actorIsSuperAdmin={session.role === 'super_admin'}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="policies" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Policy register</CardTitle>
                                <CardDescription>Versioned rules with owners, effective dates and acknowledgements.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data.policies.length === 0 ? (
                                    <Muted>No policies published. The privacy notice and internship handbook belong here.</Muted>
                                ) : (
                                    <ul className="divide-y">
                                        {data.policies.map((policy) => (
                                            <li key={policy.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{policy.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Version {policy.version} · effective {formatDate(policy.effective_from)}
                                                    </p>
                                                </div>
                                                <Badge variant={policy.is_published ? 'secondary' : 'outline'}>
                                                    {policy.is_published ? 'Published' : 'Draft'}
                                                </Badge>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="privacy" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Data subject requests</CardTitle>
                                <CardDescription>
                                    Access, correction, objection, restriction, deletion and portability, each with a due date.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data.dataRequests.length === 0 ? (
                                    <Muted>No requests received.</Muted>
                                ) : (
                                    <ul className="divide-y">
                                        {data.dataRequests.map((request) => (
                                            <li key={request.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {humanise(request.request_type)} · {request.requester_email}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Received {formatDate(request.created_at)}
                                                        {request.due_at ? ` · due ${formatDate(request.due_at)}` : ''}
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
                                <CardTitle>Retention</CardTitle>
                                <CardDescription>How long each category is kept, and on what basis.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="divide-y">
                                    {data.retention.map((rule) => (
                                        <li key={rule.id} className="py-3 first:pt-0 last:pb-0">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-medium">{humanise(rule.record_category)}</p>
                                                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                                    {rule.retention_months} months
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">{rule.purpose}</p>
                                            {rule.legal_or_policy_basis && (
                                                <p className="mt-1 text-xs text-muted-foreground/80">
                                                    Basis: {rule.legal_or_policy_basis}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="audit" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
                                    Audit trail
                                </CardTitle>
                                <CardDescription>
                                    Who did what, to which record, and which fields changed. Deliberately does not copy the
                                    record contents — an audit log that duplicates sensitive data becomes a second thing to
                                    protect.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data.audits.length === 0 ? (
                                    <Muted>No activity recorded yet.</Muted>
                                ) : (
                                    <ul className="divide-y text-sm">
                                        {data.audits.map((entry) => (
                                            <li key={entry.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                                                <Badge variant="outline" className="font-mono text-[10px]">
                                                    {entry.action}
                                                </Badge>
                                                <span className="font-medium">{entry.table_name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {entry.actor_role ?? 'system'} · {formatRelativeTime(entry.occurred_at)}
                                                </span>
                                                {entry.changed_fields.length > 0 && (
                                                    <span className="truncate text-xs text-muted-foreground/80">
                                                        {entry.changed_fields.join(', ')}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </Section>
        </div>
    );
}

function Muted({ children }: { children: React.ReactNode }) {
    return <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</p>;
}
