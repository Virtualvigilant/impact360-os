'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Loader2, CheckCircle2, XCircle, Github, Globe,
    Calendar, FileText, User, ClipboardList
} from 'lucide-react';
import { supabaseClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/format';

interface TaskSubmissionDetail {
    // Task info
    taskId: string;
    taskTitle: string;
    taskDescription?: string;
    taskDueDate?: string;
    taskStatus: string;
    // Assignee
    memberName: string;
    memberEmail: string;
    // Team
    teamName: string;
    // Submission
    githubUrl?: string;
    demoUrl?: string;
    notes?: string;
    submittedAt: string;
}

interface TaskReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    details: TaskSubmissionDetail;
    onReviewed: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    not_started: { label: 'To Do', variant: 'outline' },
    in_progress: { label: 'In Progress', variant: 'secondary' },
    submitted: { label: 'Submitted', variant: 'default' },
    completed: { label: 'Completed', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
};

export function TaskReviewDialog({
    isOpen,
    onClose,
    details,
    onReviewed,
}: TaskReviewDialogProps) {
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
    const [done, setDone] = useState<'approved' | 'rejected' | null>(null);

    const handleClose = () => {
        setReview('');
        setDone(null);
        onClose();
    };

    const handleReview = async (action: 'approve' | 'reject') => {
        setLoading(action);
        const supabase = supabaseClient();
        const newStatus = action === 'approve' ? 'completed' : 'rejected';

        try {
            const { error } = await (supabase
                .from('team_tasks') as any)
                .update({
                    status: newStatus,
                    admin_review: review.trim() || null,
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', details.taskId);

            if (error) throw error;

            // Notify the member
            const { data: memberProfile } = await (supabase
                .from('profiles') as any)
                .select('id')
                .eq('email', details.memberEmail)
                .single();

            if (memberProfile) {
                await (supabase.from('notifications') as any).insert({
                    user_id: (memberProfile as any).id,
                    title: action === 'approve' ? '✅ Task Approved' : '❌ Task Rejected',
                    message: action === 'approve'
                        ? `Your task "${details.taskTitle}" has been approved!${review.trim() ? ' Check the review for details.' : ''}`
                        : `Your task "${details.taskTitle}" was rejected.${review.trim() ? ' Check the review for feedback.' : ''}`,
                    type: 'task_review',
                    related_id: details.taskId,
                });
            }

            setDone(action === 'approve' ? 'approved' : 'rejected');
            setTimeout(() => {
                handleClose();
                onReviewed();
            }, 1800);
        } catch (error) {
            console.error('Error reviewing task:', error);
            alert(`Failed to submit review: ${(error as any).message || 'Unknown error'}`);
        } finally {
            setLoading(null);
        }
    };

    const config = STATUS_CONFIG[details.taskStatus] ?? STATUS_CONFIG.submitted;
    const isPending = details.taskStatus === 'submitted';

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Task Submission
                    </DialogTitle>
                    <DialogDescription>
                        Review submission details and leave feedback.
                    </DialogDescription>
                </DialogHeader>

                {done ? (
                    <div className="py-8 text-center space-y-3">
                        {done === 'approved' ? (
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                        ) : (
                            <XCircle className="h-12 w-12 text-destructive mx-auto" />
                        )}
                        <p className="text-lg font-medium">
                            Task {done === 'approved' ? 'Approved!' : 'Rejected'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {review.trim()
                                ? 'Your review has been sent to the member.'
                                : 'The member has been notified.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5 mt-2">
                        {/* Task Info */}
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="font-semibold text-base">{details.taskTitle}</h3>
                                    {details.taskDescription && (
                                        <p className="text-sm text-muted-foreground mt-1">{details.taskDescription}</p>
                                    )}
                                </div>
                                <Badge variant={config.variant} className="shrink-0 text-xs">
                                    {config.label}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{details.memberName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <FileText className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">Team: {details.teamName}</span>
                                </div>
                                {details.taskDueDate && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                                        <span>Due: {formatDate(details.taskDueDate)}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                                    <span>Submitted: {formatDate(details.submittedAt)}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Submission Links */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submission</p>
                            <div className="space-y-2">
                                {details.githubUrl ? (
                                    <a
                                        href={details.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-primary hover:underline bg-muted/50 rounded-md px-3 py-2"
                                    >
                                        <Github className="h-4 w-4" />
                                        {details.githubUrl}
                                    </a>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic px-3">No GitHub URL provided</p>
                                )}
                                {details.demoUrl && (
                                    <a
                                        href={details.demoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-primary hover:underline bg-muted/50 rounded-md px-3 py-2"
                                    >
                                        <Globe className="h-4 w-4" />
                                        {details.demoUrl}
                                    </a>
                                )}
                                {details.notes && (
                                    <div className="bg-muted/50 rounded-md px-3 py-2">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Member Notes</p>
                                        <p className="text-sm">{details.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isPending && (
                            <>
                                <Separator />

                                {/* Admin Review */}
                                <div className="space-y-2">
                                    <Label htmlFor="admin-review">
                                        Your Review{' '}
                                        <span className="text-muted-foreground text-xs font-normal">(optional but recommended)</span>
                                    </Label>
                                    <Textarea
                                        id="admin-review"
                                        placeholder="Leave detailed feedback for the member — what was done well, what needs improvement, or why you're rejecting..."
                                        value={review}
                                        onChange={(e) => setReview(e.target.value)}
                                        rows={4}
                                        className="resize-none"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-1">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleReview('approve')}
                                        disabled={!!loading}
                                    >
                                        {loading === 'approve' ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                        )}
                                        Approve
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleReview('reject')}
                                        disabled={!!loading}
                                    >
                                        {loading === 'reject' ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <XCircle className="mr-2 h-4 w-4" />
                                        )}
                                        Reject
                                    </Button>
                                </div>
                            </>
                        )}

                        {!isPending && (
                            <div className="text-center text-sm text-muted-foreground pt-2">
                                This task has already been <strong>{details.taskStatus}</strong>.
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
