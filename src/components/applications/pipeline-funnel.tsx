import Link from 'next/link';
import { PIPELINE_STAGES, TERMINAL_STAGES, type ApplicationStatus } from '@/lib/domain/pipeline';
import { humanise } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

/**
 * The funnel, counted by the database.
 *
 * Terminal outcomes sit apart from the pipeline rather than at the end of it: a
 * rejection is not a later stage than an interview, and drawing it in line implies a
 * progression that does not exist.
 */
export function PipelineFunnel({
    counts,
    active,
}: {
    counts: Record<ApplicationStatus, number>;
    active?: ApplicationStatus;
}) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3 lg:grid-cols-6">
                {PIPELINE_STAGES.map((stage) => (
                    <Stage key={stage} stage={stage} count={counts[stage] ?? 0} active={active === stage} />
                ))}
            </div>
            <div className="flex flex-wrap gap-2">
                {TERMINAL_STAGES.map((stage) => (
                    <Link
                        key={stage}
                        href={`/dashboard/applications?status=${stage}`}
                        className={cn(
                            'rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted',
                            active === stage && 'border-primary bg-primary/10 text-primary',
                        )}
                    >
                        {humanise(stage)} · {counts[stage] ?? 0}
                    </Link>
                ))}
            </div>
        </div>
    );
}

function Stage({ stage, count, active }: { stage: ApplicationStatus; count: number; active: boolean }) {
    return (
        <Link
            href={`/dashboard/applications${active ? '' : `?status=${stage}`}`}
            className={cn('block bg-card p-4 transition-colors hover:bg-muted/50', active && 'bg-primary/5')}
        >
            <p className={cn('text-2xl font-semibold tabular-nums', active && 'text-primary')}>{count}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{humanise(stage)}</p>
        </Link>
    );
}
