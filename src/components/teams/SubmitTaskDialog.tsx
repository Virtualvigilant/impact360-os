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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle2, Github, Globe } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase/client';

interface SubmitTaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    taskId: string;
    taskTitle: string;
    onSubmitted: () => void;
}

export function SubmitTaskDialog({
    isOpen,
    onClose,
    taskId,
    taskTitle,
    onSubmitted,
}: SubmitTaskDialogProps) {
    const [githubUrl, setGithubUrl] = useState('');
    const [demoUrl, setDemoUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleClose = () => {
        setGithubUrl('');
        setDemoUrl('');
        setNotes('');
        setSuccess(false);
        onClose();
    };

    const handleSubmit = async () => {
        if (!githubUrl.trim() && !demoUrl.trim() && !notes.trim()) {
            alert('Please provide at least a GitHub URL, demo URL, or notes.');
            return;
        }

        setLoading(true);
        const supabase = supabaseClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Insert submission
            const { error: subError } = await (supabase
                .from('team_task_submissions') as any)
                .insert({
                    task_id: taskId,
                    member_id: user.id,
                    github_url: githubUrl.trim() || null,
                    demo_url: demoUrl.trim() || null,
                    notes: notes.trim() || null,
                });

            if (subError) throw subError;

            // Update task status to 'submitted'
            const { error: updateError } = await (supabase
                .from('team_tasks') as any)
                .update({ status: 'submitted' })
                .eq('id', taskId);

            if (updateError) throw updateError;

            // Notify admins & mentors
            const { data: admins } = await supabase
                .from('profiles')
                .select('id')
                .in('role', ['admin', 'mentor']);

            if (admins && admins.length > 0) {
                const notifications = admins.map((admin: any) => ({
                    user_id: admin.id,
                    title: 'Task Submitted',
                    message: `A member has submitted their work on task: "${taskTitle}"`,
                    type: 'task_submission',
                    related_id: taskId,
                }));
                await (supabase.from('notifications') as any).insert(notifications);
            }

            setSuccess(true);
            setTimeout(() => {
                handleClose();
                onSubmitted();
            }, 1500);
        } catch (error) {
            console.error('Error submitting task:', error);
            alert(`Failed to submit: ${(error as any).message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Submit Task Work</DialogTitle>
                    <DialogDescription>
                        Submit your completed work for: <strong>{taskTitle}</strong>
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center space-y-4">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                        <p className="text-lg font-medium">Work submitted successfully!</p>
                        <p className="text-sm text-muted-foreground">Your admin will review your submission shortly.</p>
                    </div>
                ) : (
                    <div className="space-y-4 mt-2">
                        {/* GitHub URL */}
                        <div className="space-y-2">
                            <Label htmlFor="github-url" className="flex items-center gap-2">
                                <Github className="h-4 w-4" />
                                GitHub Repository URL
                            </Label>
                            <Input
                                id="github-url"
                                type="url"
                                placeholder="https://github.com/username/repo"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                            />
                        </div>

                        {/* Demo URL */}
                        <div className="space-y-2">
                            <Label htmlFor="demo-url" className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Live Demo URL <span className="text-muted-foreground text-xs">(optional)</span>
                            </Label>
                            <Input
                                id="demo-url"
                                type="url"
                                placeholder="https://your-demo.vercel.app"
                                value={demoUrl}
                                onChange={(e) => setDemoUrl(e.target.value)}
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Textarea
                                id="notes"
                                placeholder="Any additional context, known issues, or notes for the reviewer..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Work'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
