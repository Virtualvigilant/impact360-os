'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Loader2, Users, Calendar, ArrowLeft, Plus,
    CheckCircle2, Clock, AlertCircle, Github, Globe, ClipboardList
} from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils/format';
import Link from 'next/link';
import { AssignTeamTaskDialog } from '@/components/admin/AssignTeamTaskDialog';
import { TeamTask } from '@/types/database.types';

interface TeamMember {
    user_id: string;
    role: string;
    profile: {
        full_name: string;
        avatar_url?: string;
        email?: string;
    };
}

interface TeamProjectAssignment {
    id: string;
    status: string;
    started_at?: string;
    completed_at?: string;
    submitted_at?: string;
    milestone_progress?: Record<string, { status: 'pending' | 'completed'; completed_at?: string }>;
    project: {
        id: string;
        title: string;
        description: string;
        difficulty: string;
        deadline?: string;
        milestones: {
            id: string;
            title: string;
            description: string;
        }[];
    };
}

interface TeamDetails {
    id: string;
    name: string;
    created_at: string;
    members: TeamMember[];
    assignments: TeamProjectAssignment[];
}

type TaskWithSubmission = TeamTask & {
    submission?: { github_url?: string; demo_url?: string; submitted_at: string } | null;
};

const TASK_STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    not_started: { label: 'To Do', variant: 'outline' },
    in_progress: { label: 'In Progress', variant: 'secondary' },
    submitted: { label: 'Submitted', variant: 'default' },
    completed: { label: 'Completed', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
};

export default function TeamDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { isAdmin, isMentor } = useAuth();
    const [team, setTeam] = useState<TeamDetails | null>(null);
    const [tasks, setTasks] = useState<TaskWithSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [assignTaskOpen, setAssignTaskOpen] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchTeamDetails();
            fetchTeamTasks();
        }
    }, [params.id]);

    const fetchTeamDetails = async () => {
        const supabase = supabaseClient();
        try {
            const { data: teamData, error: teamError } = await (supabase
                .from('teams') as any)
                .select(`
                    id,
                    name,
                    created_at,
                    members:team_members(
                        user_id,
                        role,
                        profile:profiles(full_name, avatar_url, email)
                    )
                `)
                .eq('id', params.id)
                .single();

            if (teamError) throw teamError;

            const { data: assignmentsData, error: assignmentsError } = await (supabase
                .from('project_assignments') as any)
                .select(`
                    id,
                    status,
                    started_at,
                    completed_at,
                    submitted_at,
                    milestone_progress,
                    project:projects(
                        id,
                        title,
                        description,
                        difficulty,
                        deadline,
                        milestones
                    )
                `)
                .eq('team_id', params.id);

            if (assignmentsError) throw assignmentsError;

            const uniqueAssignments = Array.from(
                new Map(assignmentsData.map((item: any) => [item.project.id, item])).values()
            );

            setTeam({ ...teamData, assignments: uniqueAssignments } as any);
        } catch (error) {
            console.error('Error fetching team details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamTasks = async () => {
        const supabase = supabaseClient();
        try {
            const { data, error } = await (supabase
                .from('team_tasks') as any)
                .select(`
                    *,
                    assignee:profiles!team_tasks_assigned_to_fkey(full_name, avatar_url),
                    submission:team_task_submissions(github_url, demo_url, submitted_at)
                `)
                .eq('team_id', params.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks((data || []).map((t: any) => ({
                ...t,
                submission: t.submission?.[0] ?? null,
            })));
        } catch (error) {
            console.error('Error fetching team tasks:', error);
        }
    };

    const handleEvaluateTask = async (taskId: string, newStatus: 'completed' | 'rejected') => {
        const supabase = supabaseClient();
        try {
            const { error } = await (supabase
                .from('team_tasks') as any)
                .update({ status: newStatus })
                .eq('id', taskId);

            if (error) throw error;
            fetchTeamTasks();
        } catch (error) {
            console.error('Error evaluating task:', error);
            alert('Failed to update task status.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/teams">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Teams
                    </Link>
                </Button>
                <div className="flex items-center justify-center h-64 border rounded-lg bg-card">
                    <p className="text-muted-foreground">Team not found</p>
                </div>
            </div>
        );
    }

    // Group tasks by assigned member
    const tasksByMember: Record<string, TaskWithSubmission[]> = {};
    tasks.forEach(task => {
        if (!tasksByMember[task.assigned_to]) tasksByMember[task.assigned_to] = [];
        tasksByMember[task.assigned_to].push(task);
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild className="-ml-2">
                            <Link href="/dashboard/teams">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2 ml-8">
                        <Calendar className="h-4 w-4" />
                        Created {formatDate(team.created_at)}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Projects + Tasks */}
                <div className="md:col-span-2 space-y-8">

                    {/* Active Projects */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Active Projects</h2>
                        {team.assignments.length > 0 ? (
                            team.assignments.map((assignment) => (
                                <Card key={assignment.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle>{assignment.project.title}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {assignment.project.description}
                                                </CardDescription>
                                            </div>
                                            <Badge variant={assignment.status === 'completed' ? 'default' : 'secondary'}>
                                                {assignment.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {assignment.project.milestones && assignment.project.milestones.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-muted-foreground">Progress</span>
                                                    <span>
                                                        {Object.values(assignment.milestone_progress || {}).filter((m: any) => m.status === 'completed').length}
                                                        {' / '}
                                                        {assignment.project.milestones.length} Milestones
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-500"
                                                        style={{
                                                            width: `${(Object.values(assignment.milestone_progress || {}).filter((m: any) => m.status === 'completed').length / assignment.project.milestones.length) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                                <div className="mt-4 grid gap-2">
                                                    {assignment.project.milestones.map(m => {
                                                        const isCompleted = assignment.milestone_progress?.[m.id]?.status === 'completed';
                                                        return (
                                                            <div key={m.id} className="flex items-center gap-2 text-sm">
                                                                <div className={`h-2 w-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                                <span className={isCompleted ? 'text-muted-foreground line-through' : ''}>{m.title}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex gap-4 text-sm text-muted-foreground pt-2">
                                            {assignment.started_at && (
                                                <div>Started: {formatDate(assignment.started_at)}</div>
                                            )}
                                            {assignment.submitted_at && (
                                                <div>Submitted: {formatDate(assignment.submitted_at)}</div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    No active projects assigned to this team.
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Team Tasks Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" />
                                Team Tasks
                                <Badge variant="outline">{tasks.length}</Badge>
                            </h2>
                            {(isAdmin || isMentor) && (
                                <Button size="sm" onClick={() => setAssignTaskOpen(true)}>
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Assign Task
                                </Button>
                            )}
                        </div>

                        {tasks.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground space-y-2">
                                    <ClipboardList className="h-8 w-8 mx-auto opacity-40" />
                                    <p className="text-sm">No tasks assigned yet.</p>
                                    {(isAdmin || isMentor) && (
                                        <Button size="sm" variant="outline" onClick={() => setAssignTaskOpen(true)}>
                                            <Plus className="mr-1.5 h-3 w-3" />
                                            Assign First Task
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {team.members.map((member) => {
                                    const memberTasks = tasksByMember[member.user_id] || [];
                                    return (
                                        <Card key={member.user_id}>
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border">
                                                        <AvatarFallback>{getInitials(member.profile?.full_name || 'User')}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-sm">{member.profile?.full_name}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                                    </div>
                                                    <Badge variant="outline" className="ml-auto text-xs">
                                                        {memberTasks.length} task{memberTasks.length !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {memberTasks.length === 0 ? (
                                                    <p className="text-xs text-muted-foreground italic">No tasks assigned to this member.</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {memberTasks.map((task) => {
                                                            const config = TASK_STATUS_CONFIG[task.status] ?? TASK_STATUS_CONFIG.not_started;
                                                            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                                                            return (
                                                                <div key={task.id} className="border rounded-lg p-3 space-y-2">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-sm">{task.title}</p>
                                                                            {task.description && (
                                                                                <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                                                                            )}
                                                                        </div>
                                                                        <Badge variant={config.variant} className="text-xs shrink-0">
                                                                            {config.label}
                                                                        </Badge>
                                                                    </div>

                                                                    {task.due_date && (
                                                                        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                                            <Calendar className="h-3 w-3" />
                                                                            {isOverdue ? 'Overdue: ' : 'Due: '}{formatDate(task.due_date)}
                                                                        </div>
                                                                    )}

                                                                    {/* Submission Links */}
                                                                    {task.submission && (
                                                                        <div className="flex gap-3 text-xs">
                                                                            {task.submission.github_url && (
                                                                                <a href={task.submission.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                                                                    <Github className="h-3 w-3" /> GitHub
                                                                                </a>
                                                                            )}
                                                                            {task.submission.demo_url && (
                                                                                <a href={task.submission.demo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                                                                    <Globe className="h-3 w-3" /> Demo
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* Evaluate Buttons (admin/mentor only) */}
                                                                    {(isAdmin || isMentor) && task.status === 'submitted' && (
                                                                        <div className="flex gap-2 pt-1">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="text-xs h-7 text-green-600 border-green-600/30 hover:bg-green-600/10"
                                                                                onClick={() => handleEvaluateTask(task.id, 'completed')}
                                                                            >
                                                                                <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/10"
                                                                                onClick={() => handleEvaluateTask(task.id, 'rejected')}
                                                                            >
                                                                                <AlertCircle className="h-3 w-3 mr-1" /> Reject
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Members */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Team Members</h2>
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {team.members.map((member) => (
                                    <div key={member.user_id} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarFallback>{getInitials(member.profile?.full_name || 'User')}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{member.profile?.full_name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/dashboard/members/${member.user_id}`}>
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Assign Task Dialog */}
            {team && (
                <AssignTeamTaskDialog
                    isOpen={assignTaskOpen}
                    onClose={() => setAssignTaskOpen(false)}
                    teamId={team.id}
                    teamName={team.name}
                    members={team.members}
                    onTaskCreated={fetchTeamTasks}
                />
            )}
        </div>
    );
}
