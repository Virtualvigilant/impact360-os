'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { reviewCheckIn } from '@/lib/actions/development';
import type { CheckInRow } from '@/lib/data/development';
import { formatDate, formatRelativeTime } from '@/lib/utils/format';
import { StatusBadge } from '@/components/primitives/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const WELLBEING_LABELS = ['', 'Struggling', 'Difficult', 'Manageable', 'Good', 'Very good'];

export function CheckInCard({ checkIn, canReview }: { checkIn: CheckInRow; canReview: boolean }) {
    const router = useRouter();
    const [feedback, setFeedback] = useState('');
    const [focus, setFocus] = useState('');
    const [pending, setPending] = useState(false);

    const lowWellbeing = (checkIn.wellbeing_rating ?? 5) <= 2;

    async function review() {
        setPending(true);
        const result = await reviewCheckIn({
            check_in_id: checkIn.id,
            mentor_feedback: feedback,
            mentor_focus: focus,
        });
        setPending(false);

        if (result.ok) {
            toast.success('Review recorded');
            setFeedback('');
            setFocus('');
            router.refresh();
        } else {
            toast.error(result.error);
        }
    }

    return (
        <Card className={lowWellbeing && checkIn.status !== 'reviewed' ? 'border-amber-500/40' : undefined}>
            <CardHeader>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                        <CardTitle>{checkIn.placement?.intern?.full_name ?? 'Weekly reflection'}</CardTitle>
                        <CardDescription>
                            {formatDate(checkIn.period_start)} – {formatDate(checkIn.period_end)}
                            {checkIn.submitted_at ? ` · submitted ${formatRelativeTime(checkIn.submitted_at)}` : ''}
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {checkIn.wellbeing_rating != null && (
                            <span
                                className={`rounded-full border px-2.5 py-0.5 text-xs ${
                                    lowWellbeing ? 'border-amber-500/40 text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                                }`}
                            >
                                Wellbeing: {WELLBEING_LABELS[checkIn.wellbeing_rating]}
                            </span>
                        )}
                        <StatusBadge status={checkIn.status} />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                    <Entry label="Achievements" text={checkIn.achievements} />
                    <Entry label="Learning" text={checkIn.learning} />
                    <Entry label="Blockers" text={checkIn.blockers} />
                    <Entry label="Next steps" text={checkIn.next_steps} />
                </div>

                {checkIn.support_needed && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                            Support requested
                        </p>
                        <p className="mt-1.5 text-sm leading-6">{checkIn.support_needed}</p>
                    </div>
                )}

                {checkIn.mentor_feedback && (
                    <div className="rounded-xl bg-primary/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                            Mentor feedback
                            {checkIn.reviewer?.full_name ? ` · ${checkIn.reviewer.full_name}` : ''}
                        </p>
                        <p className="mt-2 text-sm leading-6">{checkIn.mentor_feedback}</p>
                        {checkIn.mentor_focus && (
                            <p className="mt-2 text-xs text-muted-foreground">Next focus: {checkIn.mentor_focus}</p>
                        )}
                    </div>
                )}

                {canReview && checkIn.status === 'submitted' && (
                    <div className="space-y-3 border-t pt-5">
                        <div className="space-y-2">
                            <Label htmlFor={`feedback-${checkIn.id}`}>Specific feedback</Label>
                            <Textarea
                                id={`feedback-${checkIn.id}`}
                                rows={3}
                                value={feedback}
                                onChange={(event) => setFeedback(event.target.value)}
                                placeholder="Respond to what they actually wrote — especially the blockers."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`focus-${checkIn.id}`}>Recommended focus for next week</Label>
                            <Textarea
                                id={`focus-${checkIn.id}`}
                                rows={2}
                                value={focus}
                                onChange={(event) => setFocus(event.target.value)}
                            />
                        </div>
                        <Button size="sm" onClick={review} disabled={pending || feedback.trim().length === 0}>
                            {pending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                            ) : (
                                <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden />
                            )}
                            Complete review
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function Entry({ label, text }: { label: string; text: string | null }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-6">{text || 'Not provided'}</p>
        </div>
    );
}
