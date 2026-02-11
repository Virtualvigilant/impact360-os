'use client';

import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ClipboardCheck, Star } from 'lucide-react';

interface AddEvaluationDialogProps {
    memberId: string;
    memberName: string;
    onEvaluationAdded: () => void;
}

const CRITERIA = [
    { key: 'code_quality', label: 'Code Quality', description: 'Clean, readable, well-structured code' },
    { key: 'architecture', label: 'Architecture', description: 'System design and component organization' },
    { key: 'problem_solving', label: 'Problem Solving', description: 'Approach to challenges, debugging skills' },
    { key: 'communication', label: 'Communication', description: 'Clarity in documentation and discussions' },
    { key: 'teamwork', label: 'Teamwork', description: 'Collaboration, code reviews, helping others' },
    { key: 'reliability', label: 'Reliability', description: 'Meeting deadlines, consistency, follow-through' },
] as const;

type ScoreKey = typeof CRITERIA[number]['key'];

export function AddEvaluationDialog({
    memberId,
    memberName,
    onEvaluationAdded,
}: AddEvaluationDialogProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [scores, setScores] = useState<Record<ScoreKey, number>>({
        code_quality: 0,
        architecture: 0,
        problem_solving: 0,
        communication: 0,
        teamwork: 0,
        reliability: 0,
    });

    const allScored = Object.values(scores).every((s) => s > 0);
    const averageScore =
        Object.values(scores).reduce((sum, s) => sum + s, 0) / Object.values(scores).length;

    const handleSubmit = async () => {
        if (!user?.id || !allScored) return;
        setLoading(true);
        const supabase = supabaseClient();

        try {
            const { error } = await supabase.from('evaluations').insert({
                submission_id: null,
                member_id: memberId,
                evaluator_id: user.id,
                ...scores,
                average_score: Number(averageScore.toFixed(2)),
                feedback: feedback.trim() || null,
                evaluated_at: new Date().toISOString(),
            });

            if (error) throw error;

            // Notify the member
            await supabase.from('notifications').insert({
                user_id: memberId,
                title: 'New Evaluation Received',
                message: `You received a new evaluation with an average score of ${averageScore.toFixed(1)}/5.`,
                type: 'evaluation',
            });

            // Reset form and close
            setScores({
                code_quality: 0,
                architecture: 0,
                problem_solving: 0,
                communication: 0,
                teamwork: 0,
                reliability: 0,
            });
            setFeedback('');
            setOpen(false);
            onEvaluationAdded();
        } catch (error: any) {
            console.error('Error adding evaluation:', error?.message || error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Add Evaluation
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Evaluate {memberName}</DialogTitle>
                    <DialogDescription>
                        Rate each skill from 1 to 5 and provide optional feedback.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Score Criteria */}
                    {CRITERIA.map(({ key, label, description }) => (
                        <div key={key} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="font-medium">{label}</Label>
                                    <p className="text-xs text-muted-foreground">{description}</p>
                                </div>
                                <span className="text-sm font-semibold tabular-nums w-8 text-right">
                                    {scores[key] > 0 ? `${scores[key]}/5` : '—'}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() =>
                                            setScores((prev) => ({ ...prev, [key]: value }))
                                        }
                                        className="group"
                                    >
                                        <Star
                                            className={`h-7 w-7 transition-colors ${value <= scores[key]
                                                ? 'text-yellow-500 fill-yellow-500'
                                                : 'text-muted-foreground/30 group-hover:text-yellow-400'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Average Preview */}
                    {allScored && (
                        <div className="rounded-lg border p-3 bg-muted/30 text-center">
                            <p className="text-sm text-muted-foreground">Average Score</p>
                            <p className="text-2xl font-bold">{averageScore.toFixed(1)}/5</p>
                        </div>
                    )}

                    {/* Feedback */}
                    <div className="space-y-2">
                        <Label htmlFor="feedback">Feedback (optional)</Label>
                        <Textarea
                            id="feedback"
                            placeholder="Provide constructive feedback on strengths and areas for improvement..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!allScored || loading}>
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Submit Evaluation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
