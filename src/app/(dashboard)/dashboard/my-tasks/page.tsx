'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { TeamTask } from '@/types/database.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ClipboardList, Calendar, CheckCircle2, Clock, Play, ExternalLink, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { SubmitTaskDialog } from '@/components/teams/SubmitTaskDialog';

type TaskWithTeam = TeamTask & {
    team: { name: string };
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; color: string }> = {
    not_started: { label: 'To Do', variant: 'outline', color: 'text-slate-400' },
    in_progress: { label: 'In Progress', variant: 'secondary', color: 'text-blue-400' },
    submitted: { label: 'Submitted', variant: 'default', color: 'text-yellow-400' },
    completed: { label: 'Completed', variant: 'default', color: 'text-green-400' },
    rejected: { label: 'Rejected', variant: 'destructive', color: 'text-red-400' },
};

export default function MyTasksPage() {
    const { profile } = useAuth();
    const [tasks, setTasks] = useState<TaskWithTeam[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskWithTeam | null>(null);

    useEffect(() => {
        if (profile?.id) {
            fetchTasks();
        }
    }, [profile?.id]);

    const fetchTasks = async () => {
        const supabase = supabaseClient();
        try {
            const { data, error } = await (supabase
                .from('team_tasks') as any)
                .select(`
                    *,
                    team:teams(name)
                `)
                .eq('assigned_to', profile!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks((data || []) as TaskWithTeam[]);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkInProgress = async (taskId: string) => {
        const supabase = supabaseClient();
        try {
            const { error } = await (supabase
                .from('team_tasks') as any)
                .update({ status: 'in_progress' })
                .eq('id', taskId);

            if (error) throw error;
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task status.');
        }
    };

    const openSubmitDialog = (task: TaskWithTeam) => {
        setSelectedTask(task);
        setSubmitDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Group tasks by status
    const activeTasks = tasks.filter(t => t.status === 'not_started' || t.status === 'in_progress');
    const submittedTasks = tasks.filter(t => t.status === 'submitted');
    const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'rejected');

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                <p className="text-muted-foreground mt-2">
                    Tasks assigned to you by your team admin.
                </p>
            </div>

            {tasks.length === 0 ? (
                <div className="text-center py-16">
                    <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-medium">No tasks assigned yet</h3>
                    <p className="text-muted-foreground mt-1">Tasks from your team will appear here once they're assigned.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Active Tasks */}
                    {activeTasks.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-400" />
                                Active Tasks
                                <Badge variant="secondary">{activeTasks.length}</Badge>
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {activeTasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onMarkInProgress={() => handleMarkInProgress(task.id)}
                                        onSubmit={() => openSubmitDialog(task)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Submitted Tasks */}
                    {submittedTasks.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-yellow-400" />
                                Awaiting Review
                                <Badge variant="secondary">{submittedTasks.length}</Badge>
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {submittedTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Completed / Rejected Tasks */}
                    {completedTasks.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                                Completed
                                <Badge variant="outline">{completedTasks.length}</Badge>
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2 opacity-70">
                                {completedTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {selectedTask && (
                <SubmitTaskDialog
                    isOpen={submitDialogOpen}
                    onClose={() => setSubmitDialogOpen(false)}
                    taskId={selectedTask.id}
                    taskTitle={selectedTask.title}
                    onSubmitted={() => {
                        setSubmitDialogOpen(false);
                        setSelectedTask(null);
                        fetchTasks();
                    }}
                />
            )}
        </div>
    );
}

interface TaskCardProps {
    task: TaskWithTeam;
    onMarkInProgress?: () => void;
    onSubmit?: () => void;
}

function TaskCard({ task, onMarkInProgress, onSubmit }: TaskCardProps) {
    const config = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.not_started;
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

    return (
        <Card className="flex flex-col hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{task.title}</CardTitle>
                        <CardDescription className="mt-0.5 text-xs">
                            Team: {task.team?.name}
                        </CardDescription>
                    </div>
                    <Badge variant={config.variant} className="shrink-0 text-xs">
                        {config.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                )}

                {task.due_date && (
                    <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                        <Calendar className="h-3 w-3" />
                        <span>{isOverdue ? 'Overdue: ' : 'Due: '}{formatDate(task.due_date)}</span>
                    </div>
                )}

                {/* Admin Review bubble — shown for completed or rejected tasks */}
                {task.admin_review && (task.status === 'completed' || task.status === 'rejected') && (
                    <div className={`rounded-md border p-3 text-sm space-y-1 ${task.status === 'completed'
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-destructive/5 border-destructive/20'
                        }`}>
                        <p className={`flex items-center gap-1.5 text-xs font-semibold ${task.status === 'completed' ? 'text-green-600' : 'text-destructive'
                            }`}>
                            <MessageSquare className="h-3 w-3" />
                            Admin Feedback
                        </p>
                        <p className="text-muted-foreground leading-relaxed">{task.admin_review}</p>
                        {task.reviewed_at && (
                            <p className="text-xs text-muted-foreground/60">{formatDate(task.reviewed_at)}</p>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                {task.status === 'not_started' && onMarkInProgress && (
                    <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={onMarkInProgress}>
                            <Play className="h-3 w-3 mr-1.5" />
                            Mark In Progress
                        </Button>
                        {onSubmit && (
                            <Button size="sm" className="flex-1 text-xs" onClick={onSubmit}>
                                Submit Work
                            </Button>
                        )}
                    </div>
                )}
                {task.status === 'in_progress' && onSubmit && (
                    <Button size="sm" className="w-full text-xs" onClick={onSubmit}>
                        <ExternalLink className="h-3 w-3 mr-1.5" />
                        Submit Work
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
