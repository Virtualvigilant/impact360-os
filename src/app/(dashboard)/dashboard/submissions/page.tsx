'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { ProjectAssignment, Submission } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, CheckCircle2, Clock, FileText, ClipboardList } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskReviewDialog } from '@/components/admin/TaskReviewDialog';

interface SubmissionWithDetails extends Submission {
    assignment: ProjectAssignment & {
        project: { title: string; difficulty: string };
        member_profile: {
            profile: { full_name: string; email: string };
        };
    };
}

interface TaskSubmissionWithDetails {
    id: string;
    github_url?: string;
    demo_url?: string;
    notes?: string;
    submitted_at: string;
    task: {
        id: string;
        title: string;
        description?: string;
        status: string;
        due_date?: string;
        admin_review?: string;
        team: { name: string };
    };
    member: {
        full_name: string;
        email: string;
    };
}

export default function SubmissionsPage() {
    const { profile, isAdmin, isMentor } = useAuth();
    const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
    const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmissionWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [taskLoading, setTaskLoading] = useState(true);
    const [reviewDialog, setReviewDialog] = useState<{ open: boolean; sub: TaskSubmissionWithDetails | null }>({
        open: false,
        sub: null,
    });

    useEffect(() => {
        if (profile?.id && (isAdmin || isMentor)) {
            fetchSubmissions();
            fetchTaskSubmissions();
        }
    }, [profile?.id, isAdmin, isMentor]);

    const fetchSubmissions = async () => {
        const supabase = supabaseClient();
        try {
            const { data, error } = await supabase
                .from('submissions')
                .select(`
                    *,
                    assignment:project_assignments!inner(
                        *,
                        project:projects(title, difficulty),
                        member_profile:member_profiles(
                            profile:profiles(full_name, email)
                        )
                    )
                `)
                .eq('assignment.status', 'submitted')
                .order('submitted_at', { ascending: false });

            if (error) throw error;
            if (data) {
                setSubmissions(data.filter((s: any) => s.assignment.status === 'submitted'));
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTaskSubmissions = async () => {
        const supabase = supabaseClient();
        try {
            const { data, error } = await (supabase
                .from('team_task_submissions') as any)
                .select(`
                    *,
                    task:team_tasks(
                        id,
                        title,
                        description,
                        status,
                        due_date,
                        admin_review,
                        team:teams(name)
                    ),
                    member:profiles!team_task_submissions_member_id_fkey(full_name, email)
                `)
                .order('submitted_at', { ascending: false });

            if (error) throw error;
            setTaskSubmissions(data || []);
        } catch (error) {
            console.error('Error fetching task submissions:', error);
        } finally {
            setTaskLoading(false);
        }
    };

    if (!isAdmin && !isMentor) {
        return (
            <Card>
                <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">
                        You don't have permission to view this page
                    </p>
                </CardContent>
            </Card>
        );
    }

    const pendingTaskSubs = taskSubmissions.filter(s => s.task?.status === 'submitted');

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
                <p className="text-muted-foreground mt-2">
                    Review and evaluate pending project and task submissions.
                </p>
            </div>

            <Tabs defaultValue="projects">
                <TabsList>
                    <TabsTrigger value="projects" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Project Submissions
                        {!loading && submissions.length > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs">{submissions.length}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Task Submissions
                        {!taskLoading && pendingTaskSubs.length > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs">{pendingTaskSubs.length}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* ---- PROJECT SUBMISSIONS ---- */}
                <TabsContent value="projects" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{loading ? 'Loading...' : `Pending Reviews (${submissions.length})`}</CardTitle>
                            <CardDescription>Students waiting for feedback</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : submissions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500/50" />
                                    <p>No pending project submissions!</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Project</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead>Links</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {submissions.map((submission) => (
                                            <TableRow key={submission.id}>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {submission.assignment.member_profile.profile.full_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {submission.assignment.member_profile.profile.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{submission.assignment.project.title}</div>
                                                    <Badge variant="outline" className="mt-1 text-xs">
                                                        {submission.assignment.project.difficulty}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{formatDate(submission.submitted_at)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {submission.github_url && (
                                                        <a href={submission.github_url} target="_blank" rel="noopener noreferrer"
                                                            className="text-primary hover:underline flex items-center gap-1 text-sm">
                                                            GitHub <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" asChild>
                                                        <Link href={`/dashboard/evaluate/${submission.id}`}>Evaluate</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ---- TASK SUBMISSIONS ---- */}
                <TabsContent value="tasks" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{taskLoading ? 'Loading...' : `Task Submissions (${taskSubmissions.length})`}</CardTitle>
                            <CardDescription>Team task work submitted by members</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {taskLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : taskSubmissions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500/50" />
                                    <p>No task submissions yet!</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Member</TableHead>
                                            <TableHead>Task</TableHead>
                                            <TableHead>Team</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {taskSubmissions.map((sub) => {
                                            const isPending = sub.task?.status === 'submitted';
                                            return (
                                                <TableRow key={sub.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{sub.member?.full_name}</div>
                                                        <div className="text-xs text-muted-foreground">{sub.member?.email}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{sub.task?.title}</div>
                                                        {sub.notes && (
                                                            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate italic">
                                                                "{sub.notes}"
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs">
                                                            {sub.task?.team?.name}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{formatDate(sub.submitted_at)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {isPending ? (
                                                            <Badge variant="secondary" className="text-xs">Awaiting Review</Badge>
                                                        ) : (
                                                            <Badge
                                                                variant={sub.task?.status === 'completed' ? 'default' : 'destructive'}
                                                                className="text-xs"
                                                            >
                                                                {sub.task?.status === 'completed' ? 'Approved' : 'Rejected'}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant={isPending ? 'default' : 'outline'}
                                                            onClick={() => setReviewDialog({ open: true, sub })}
                                                        >
                                                            {isPending ? 'Review' : 'View Details'}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Task Review Dialog */}
            {reviewDialog.sub && (
                <TaskReviewDialog
                    isOpen={reviewDialog.open}
                    onClose={() => setReviewDialog({ open: false, sub: null })}
                    details={{
                        taskId: reviewDialog.sub.task.id,
                        taskTitle: reviewDialog.sub.task.title,
                        taskDescription: reviewDialog.sub.task.description,
                        taskDueDate: reviewDialog.sub.task.due_date,
                        taskStatus: reviewDialog.sub.task.status,
                        memberName: reviewDialog.sub.member.full_name,
                        memberEmail: reviewDialog.sub.member.email,
                        teamName: reviewDialog.sub.task.team.name,
                        githubUrl: reviewDialog.sub.github_url,
                        demoUrl: reviewDialog.sub.demo_url,
                        notes: reviewDialog.sub.notes,
                        submittedAt: reviewDialog.sub.submitted_at,
                    }}
                    onReviewed={() => {
                        setReviewDialog({ open: false, sub: null });
                        fetchTaskSubmissions();
                    }}
                />
            )}
        </div>
    );
}
