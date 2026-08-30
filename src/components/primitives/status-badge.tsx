import { Badge } from '@/components/ui/badge';
import { humanise } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

/**
 * One place that decides what a status *means*, so `rejected` reads the same colour
 * everywhere. Previously each list picked its own variant inline and they disagreed —
 * `changes_requested` was neutral on the board and destructive in the task detail.
 */
type Tone = 'neutral' | 'progress' | 'attention' | 'positive' | 'negative';

const TONE_CLASSES: Record<Tone, string> = {
    neutral: 'bg-muted text-muted-foreground border-transparent',
    progress: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-transparent',
    attention: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-transparent',
    positive: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-transparent',
    negative: 'bg-destructive/10 text-destructive border-transparent',
};

const STATUS_TONES: Record<string, Tone> = {
    // Lifecycle
    draft: 'neutral', planned: 'neutral', backlog: 'neutral', not_started: 'neutral',
    preboarding: 'neutral', requested: 'neutral', scheduled: 'neutral', received: 'neutral',
    generated: 'neutral', reserved: 'neutral',

    // Under way
    open: 'progress', active: 'progress', in_progress: 'progress', onboarding: 'progress',
    published: 'progress', submitted: 'progress', under_review: 'progress', in_review: 'progress',
    shortlisted: 'progress', interview: 'progress', assessment: 'progress', sent: 'progress',
    completing: 'progress', processing: 'progress', triaged: 'progress', identity_verification: 'progress',

    // Needs someone
    changes_requested: 'attention', at_risk: 'attention', paused: 'attention', on_hold: 'attention',
    pending: 'attention', required: 'attention', waitlisted: 'attention', high: 'attention',
    medium: 'attention', actioned: 'attention', suspended: 'attention', extended: 'attention',

    // Good
    approved: 'positive', completed: 'positive', achieved: 'positive', selected: 'positive',
    accepted: 'positive', reviewed: 'positive', resolved: 'positive', closed: 'positive',
    provisioned: 'positive', issued: 'positive', paid: 'positive', eligible: 'positive',
    filled: 'positive', low: 'positive', verified: 'positive', locked: 'positive',
    acknowledged: 'positive', returned: 'positive', waived: 'positive',

    // Bad
    rejected: 'negative', cancelled: 'negative', declined: 'negative', withdrawn: 'negative',
    terminated: 'negative', absent: 'negative', expired: 'negative', failed: 'negative',
    critical: 'negative', not_completed: 'negative', lost: 'negative', damaged: 'negative',
    revoked: 'negative', dismissed: 'negative',
};

export function StatusBadge({ status, className }: { status: string | null | undefined; className?: string }) {
    if (!status) return null;
    const tone = STATUS_TONES[status] ?? 'neutral';
    return (
        <Badge variant="outline" className={cn('font-medium', TONE_CLASSES[tone], className)}>
            {humanise(status)}
        </Badge>
    );
}

export function statusTone(status: string | null | undefined): Tone {
    return status ? (STATUS_TONES[status] ?? 'neutral') : 'neutral';
}
