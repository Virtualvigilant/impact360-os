'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { transitionTask } from '@/lib/actions/work';
import { INTERN_TRANSITIONS, REVIEWER_TRANSITIONS, TASK_COLUMNS, type TaskStatus } from '@/lib/domain/work';
import type { TaskRow } from '@/lib/data/work';
import { formatRelativeTime, humanise, isOverdue } from '@/lib/utils/format';
import { StatusBadge } from '@/components/primitives/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

const PRIORITY_TONE: Record<string, string> = {
    urgent: 'border-destructive/40 text-destructive',
    high: 'border-amber-500/40 text-amber-600 dark:text-amber-400',
    medium: 'border-transparent text-muted-foreground',
    low: 'border-transparent text-muted-foreground',
};

/**
 * The delivery board.
 *
 * The moves offered to each person come from the same transition table the server
 * enforces, so the interface never presents a button that the action will reject — and
 * a crafted request cannot make a move the interface would not have offered.
 */
export function TaskBoard({ tasks, canReview }: { tasks: TaskRow[]; canReview: boolean }) {
    const transitions = canReview ? REVIEWER_TRANSITIONS : INTERN_TRANSITIONS;

    return (
        <div className="overflow-x-auto pb-4">
            <div className="grid min-w-[1100px] grid-cols-8 gap-3">
                {TASK_COLUMNS.map((column) => {
                    const columnTasks = tasks.filter((task) => task.status === column);
                    return (
                        <section key={column} aria-label={humanise(column)}>
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <h2 className="text-xs font-semibold">{humanise(column)}</h2>
                                <Badge variant="secondary" className="tabular-nums">
                                    {columnTasks.length}
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                {columnTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} moves={transitions[task.status] ?? []} />
                                ))}
                                {columnTasks.length === 0 && (
                                    <div className="rounded-lg border border-dashed py-6 text-center text-[11px] text-muted-foreground">
                                        Empty
                                    </div>
                                )}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}

function TaskCard({ task, moves }: { task: TaskRow; moves: readonly TaskStatus[] }) {
    const router = useRouter();
    const [target, setTarget] = useState<TaskStatus | null>(null);
    const [note, setNote] = useState('');
    const [pending, setPending] = useState(false);

    const overdue = isOverdue(task.due_at) && !['completed', 'approved'].includes(task.status);

    async function move() {
        if (!target) return;
        setPending(true);
        const result = await transitionTask({ task_id: task.id, to_status: target, note });
        setPending(false);

        if (result.ok) {
            toast.success(`Moved to ${humanise(target).toLowerCase()}`);
            setTarget(null);
            setNote('');
            router.refresh();
        } else {
            toast.error(result.error);
        }
    }

    return (
        <>
            <article className="rounded-lg border bg-card p-3">
                <p className="text-[13px] font-medium leading-5">{task.title}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                    {task.task_number}
                    {task.project ? ` · ${task.project.code}` : ''}
                </p>

                {task.placement?.intern && (
                    <p className="mt-1.5 truncate text-[11px] text-muted-foreground">{task.placement.intern.full_name}</p>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className={cn('text-[10px]', PRIORITY_TONE[task.priority])}>
                        {humanise(task.priority)}
                    </Badge>
                    {task.due_at && (
                        <span className={cn('text-[10px]', overdue ? 'font-medium text-destructive' : 'text-muted-foreground')}>
                            {formatRelativeTime(task.due_at)}
                        </span>
                    )}
                </div>

                {moves.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {moves.map((move) => (
                            <Button
                                key={move}
                                size="sm"
                                variant={move === 'cancelled' ? 'ghost' : 'outline'}
                                className="h-7 px-2 text-[11px]"
                                onClick={() => setTarget(move)}
                            >
                                {humanise(move)}
                            </Button>
                        ))}
                    </div>
                )}
            </article>

            <Dialog open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Move to {target ? humanise(target).toLowerCase() : ''}</DialogTitle>
                        <DialogDescription>
                            {target === 'changes_requested'
                                ? 'Say what needs to change. This is the feedback the intern will act on.'
                                : 'Add a note if it would help whoever picks this up next. Optional.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <StatusBadge status={task.status} />
                            <span className="text-muted-foreground">→</span>
                            <StatusBadge status={target} />
                        </div>
                        <Label htmlFor={`note-${task.id}`}>Note</Label>
                        <Textarea
                            id={`note-${task.id}`}
                            rows={3}
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={move}
                            disabled={pending || (target === 'changes_requested' && note.trim().length === 0)}
                        >
                            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
