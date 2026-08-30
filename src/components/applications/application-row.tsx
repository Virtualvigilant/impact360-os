'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { decideApplication } from '@/lib/actions/recruitment';
import { nextStage, TERMINAL_STAGES } from '@/lib/domain/pipeline';
import type { ApplicationRow as Row } from '@/lib/data/applications';
import { formatRelativeTime, getInitials, humanise } from '@/lib/utils/format';
import { StatusBadge } from '@/components/primitives/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/**
 * One candidate, with the decision controls.
 *
 * Advancing used to be a single unconfirmed click that wrote a new status and nothing
 * else. Every decision here opens a dialog that requires a written reason, because the
 * reason is what makes the pipeline defensible six months later.
 */
export function ApplicationRow({ application }: { application: Row }) {
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);
    const [decision, setDecision] = useState<Row['status'] | null>(null);
    const [reason, setReason] = useState('');
    const [pending, setPending] = useState(false);

    const advanceTo = nextStage(application.status);

    async function submit() {
        if (!decision) return;
        setPending(true);
        const result = await decideApplication({
            application_id: application.id,
            status: decision,
            reason,
        });
        setPending(false);

        if (result.ok) {
            toast.success(`Moved to ${humanise(decision).toLowerCase()}`);
            setDecision(null);
            setReason('');
            router.refresh();
        } else {
            toast.error(result.error);
        }
    }

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(application.full_name)}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{application.full_name}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {application.application_number} · {application.opportunity?.title ?? 'Opportunity removed'} ·
                            applied {formatRelativeTime(application.submitted_at)}
                        </p>
                    </div>

                    <StatusBadge status={application.status} className="shrink-0" />

                    <div className="flex shrink-0 flex-wrap gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setExpanded((open) => !open)}>
                            Details
                            <ChevronDown
                                className={`ml-1 h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                                aria-hidden
                            />
                        </Button>
                        {advanceTo && (
                            <Button size="sm" onClick={() => setDecision(advanceTo)}>
                                Advance to {humanise(advanceTo).toLowerCase()}
                            </Button>
                        )}
                        {!TERMINAL_STAGES.includes(application.status) && (
                            <Button variant="outline" size="sm" onClick={() => setDecision('rejected')}>
                                Reject
                            </Button>
                        )}
                    </div>
                </div>

                {expanded && (
                    <dl className="mt-4 grid gap-4 border-t pt-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                        <Detail label="Email" value={application.email} />
                        <Detail label="Phone" value={application.phone} />
                        <Detail label="Location" value={application.location} />
                        <Detail label="Institution" value={application.institution} />
                        <Detail label="Programme" value={application.academic_programme} />
                        <Detail label="Level" value={application.academic_level} />
                        <Detail label="Skills" value={application.skills.join(', ')} />
                        <Detail label="Technologies" value={application.technologies.join(', ')} />
                        <Detail label="Interests" value={application.career_interests.join(', ')} />
                        <div className="sm:col-span-2 lg:col-span-3">
                            <Detail label="Project summary" value={application.project_summary} />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Consent</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Privacy notice {application.privacy_notice_version}, accepted{' '}
                                {formatRelativeTime(application.privacy_consent_at)}. Screening consent:{' '}
                                {application.screening_consent ? 'given' : 'not given'}.
                            </p>
                        </div>
                    </dl>
                )}
            </CardContent>

            <Dialog open={decision !== null} onOpenChange={(open) => !open && setDecision(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Move {application.full_name} to {decision ? humanise(decision).toLowerCase() : ''}
                        </DialogTitle>
                        <DialogDescription>
                            This is recorded against your name as a review, and the candidate&rsquo;s file keeps it. Say what
                            the evidence was.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <Label htmlFor="decision-reason">Reason</Label>
                        <Textarea
                            id="decision-reason"
                            rows={4}
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="What in the application supports this decision?"
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDecision(null)}>
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={pending || reason.trim().length === 0}>
                            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                            Record decision
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="mt-1 leading-6">{value || '—'}</dd>
        </div>
    );
}
