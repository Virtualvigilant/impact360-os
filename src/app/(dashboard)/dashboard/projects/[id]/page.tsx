'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { ProjectAssignment, Submission, Evaluation } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Github, Globe, CheckCircle2, Star, Trophy } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, EVALUATION_CRITERIA } from '@/lib/utils/constants';
import Link from 'next/link';
import { notifyAdminsAndMentors } from '@/lib/utils/notifications';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { profile } = useAuth();
    const [assignment, setAssignment] = useState<ProjectAssignment | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        github_url: '',
        demo_url: '',
        notes: '',
    });

    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [milestoneProgress, setMilestoneProgress] = useState<Record<string, any>>({});
    const [updatingMilestone, setUpdatingMilestone] = useState<string | null>(null);

    useEffect(() => {
        if (profile?.id && params.id) {
            fetchProjectData();
        }
    }, [profile?.id, params.id]);

    const fetchProjectData = async () => {
        if (!profile?.id || !params.id) return;

        const supabase = supabaseClient();

        try {
            // Fetch assignment
            const { data: assignmentData, error: assignmentError } = await (supabase
                .from('project_assignments') as any)
                .select(`
          *,
          project:projects(*),
          team:teams(*)
        `)
                .eq('id', params.id)
                .eq('member_id', profile.id)
                .single();

            if (assignmentError) throw assignmentError;
            if (assignmentData) {
                setAssignment(assignmentData);
                setMilestoneProgress(assignmentData.milestone_progress || {});

                // Fetch team members if team project
                if (assignmentData.team_id) {
                    const { data: membersData } = await (supabase
                        .from('team_members') as any)
                        .select(`
                            *,
                            profile:member_profiles(
                                *,
                                user_profile:profiles(*)
                            )
                        `)
                        .eq('team_id', assignmentData.team_id);

                    if (membersData) setTeamMembers(membersData);
                }

                // Fetch submission if exists (check for ANY submission for this project & team)
                let submissionQuery = (supabase
                    .from('submissions') as any)
                    .select('*')
                    .eq('project_id', assignmentData.project_id)
                    .order('submitted_at', { ascending: false })
                    .limit(1);

                if (assignmentData.team_id) {
                    // For teams, get submission by ANY member of the team for this project? 
                    // Or better, we should probably link submission to team_id in the future. 
                    // For now, we'll strip by assignment_id which is unique to user. 
                    // WAIT: If one user submits, others should see it.
                    // We need to find submissions where assignment_id belongs to any team member.
                    // Complexity: High. 
                    // Simplified: If team_id is present, look for submissions linked to `project_id` and filtered by authors who are in the team.
                    // But we don't have easy "author in team" filter without a join.
                    // Let's stick to: "If I submitted it, or if my status is submitted".
                    // Actually, if assignment.status is submitted, we should try to find the submission.
                    // Let's assume for now submissions are per-user unless we added `team_id` to submissions (which we didn't in the plan).
                    // But we DID say "Only one submission needed per team".
                    // So we should look for submissions for this project from ANY team member.

                    // Helper: Fetch all assignment IDs for this team & project
                    const { data: teamAssignments } = await (supabase
                        .from('project_assignments') as any)
                        .select('id')
                        .eq('team_id', assignmentData.team_id)
                        .eq('project_id', assignmentData.project_id);

                    if (teamAssignments && teamAssignments.length > 0) {
                        const ids = teamAssignments.map((a: any) => a.id);
                        submissionQuery = (supabase
                            .from('submissions') as any)
                            .select('*')
                            .in('assignment_id', ids)
                            .order('submitted_at', { ascending: false })
                            .limit(1);
                    }
                } else {
                    submissionQuery = submissionQuery.eq('assignment_id', assignmentData.id);
                }

                const { data: submissionData } = await submissionQuery.single();

                if (submissionData) {
                    setSubmission(submissionData);
                    setFormData({
                        github_url: submissionData.github_url || '',
                        demo_url: submissionData.demo_url || '',
                        notes: submissionData.notes || '',
                    });

                    // Fetch evaluation
                    const { data: evaluationData } = await (supabase
                        .from('evaluations') as any)
                        .select('*')
                        .eq('submission_id', submissionData.id)
                        .single();

                    if (evaluationData) {
                        setEvaluation(evaluationData);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching project data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMilestoneToggle = async (milestoneId: string, isCompleted: boolean) => {
        if (!assignment) return;
        setUpdatingMilestone(milestoneId);

        const newProgress = {
            ...milestoneProgress,
            [milestoneId]: {
                status: isCompleted ? 'completed' : 'pending',
                completed_at: isCompleted ? new Date().toISOString() : undefined
            }
        };

        const supabase = supabaseClient();
        try {
            // If team project, update for ALL members
            if (assignment.team_id) {
                const { error } = await (supabase
                    .from('project_assignments') as any)
                    .update({ milestone_progress: newProgress })
                    .eq('team_id', assignment.team_id)
                    .eq('project_id', assignment.project_id);
                if (error) throw error;
            } else {
                const { error } = await (supabase
                    .from('project_assignments') as any)
                    .update({ milestone_progress: newProgress })
                    .eq('id', assignment.id);
                if (error) throw error;
            }

            setMilestoneProgress(newProgress);
        } catch (error) {
            console.error("Error updating milestone:", error);
        } finally {
            setUpdatingMilestone(null);
        }
    };

    const handleStartProject = async () => {
        if (!assignment) return;

        const supabase = supabaseClient();

        try {
            const updates = {
                status: 'in_progress',
                started_at: new Date().toISOString(),
            };

            // If team project, start for everyone
            if (assignment.team_id) {
                const { error } = await (supabase
                    .from('project_assignments') as any)
                    .update(updates)
                    .eq('team_id', assignment.team_id)
                    .eq('project_id', assignment.project_id);
                if (error) throw error;
            } else {
                const { error } = await (supabase
                    .from('project_assignments') as any)
                    .update(updates)
                    .eq('id', assignment.id);
                if (error) throw error;
            }

            setAssignment({
                ...assignment,
                ...updates,
            } as ProjectAssignment);
        } catch (error) {
            console.error('Error starting project:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setSubmitting(true);

        if (!assignment || !profile?.id) return;

        if (!formData.github_url) {
            setError('GitHub URL is required');
            setSubmitting(false);
            return;
        }

        const supabase = supabaseClient();

        try {
            // Create submission
            const { data: submissionData, error: submissionError } = await (supabase
                .from('submissions') as any)
                .insert({
                    assignment_id: assignment.id,
                    member_id: profile.id,
                    project_id: assignment.project_id,
                    github_url: formData.github_url,
                    demo_url: formData.demo_url || null,
                    notes: formData.notes || null,
                })
                .select()
                .single();

            if (submissionError) throw submissionError;

            // Update assignment status
            const updates = {
                status: 'submitted',
                submitted_at: new Date().toISOString(),
            };

            if (assignment.team_id) {
                await (supabase
                    .from('project_assignments') as any)
                    .update(updates)
                    .eq('team_id', assignment.team_id)
                    .eq('project_id', assignment.project_id);
            } else {
                await (supabase
                    .from('project_assignments') as any)
                    .update(updates)
                    .eq('id', assignment.id);
            }

            // Notify admins and mentors
            await notifyAdminsAndMentors(
                supabase,
                'New Project Submission',
                `${assignment.team_id ? `Team ${assignment.team?.name || 'Unknown'}` : (profile.full_name || 'A student')} has submitted their work for ${assignment.project?.title}`,
                'project_submission',
                submissionData.id
            );

            setSuccess(true);
            setSubmission(submissionData);
            setAssignment({
                ...assignment,
                ...updates,
            } as ProjectAssignment);

            setTimeout(() => {
                router.push('/dashboard/projects');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to submit project');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/projects">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Projects
                    </Link>
                </Button>
                <Card>
                    <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">Project not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Calculate milestone progress
    const totalMilestones = assignment.project?.milestones?.length || 0;
    const completedMilestones = Object.values(milestoneProgress).filter((m: any) => m.status === 'completed').length;
    const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    return (
        <div className="space-y-6">
            <Button variant="ghost" asChild>
                <Link href="/dashboard/projects">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                </Link>
            </Button>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-2xl">{assignment.project?.title}</CardTitle>
                                        {assignment.team_id && (
                                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                                Team Project
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription>{assignment.project?.description}</CardDescription>
                                </div>
                                <Badge
                                    className={
                                        assignment.project?.difficulty
                                            ? DIFFICULTY_COLORS[assignment.project.difficulty]
                                            : ''
                                    }
                                >
                                    {assignment.project?.difficulty
                                        ? DIFFICULTY_LABELS[assignment.project.difficulty]
                                        : 'Unknown'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Status */}
                            <div>
                                <Label className="text-base">Status</Label>
                                <div className="mt-2">
                                    <Badge variant="outline" className="capitalize">
                                        {assignment.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-sm text-muted-foreground">Assigned</Label>
                                    <p className="mt-1">{formatDate(assignment.assigned_at)}</p>
                                </div>
                                {assignment.started_at && (
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Started</Label>
                                        <p className="mt-1">{formatDate(assignment.started_at)}</p>
                                    </div>
                                )}
                                {assignment.project?.deadline && (
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Deadline</Label>
                                        <p className="mt-1">{formatDate(assignment.project.deadline)}</p>
                                    </div>
                                )}
                            </div>

                            {/* Tech Stack */}
                            {assignment.project?.tech_stack && assignment.project.tech_stack.length > 0 && (
                                <div>
                                    <Label className="text-base">Tech Stack</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {assignment.project.tech_stack.map((tech, idx) => (
                                            <Badge key={idx} variant="secondary">
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Start Project Button */}
                            {assignment.status === 'not_started' && (
                                <Button onClick={handleStartProject} size="lg">
                                    Start Project
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Milestones */}
                    {assignment.project?.milestones && assignment.project.milestones.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Milestones</span>
                                    <span className="text-sm font-normal text-muted-foreground">
                                        {completedMilestones}/{totalMilestones} Completed
                                    </span>
                                </CardTitle>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {assignment.project.milestones.map((milestone: any) => {
                                    const isCompleted = milestoneProgress[milestone.id]?.status === 'completed';
                                    return (
                                        <div key={milestone.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
                                            <div className="pt-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isCompleted}
                                                    onChange={(e) => handleMilestoneToggle(milestone.id, e.target.checked)}
                                                    disabled={assignment.status === 'submitted' || updatingMilestone === milestone.id}
                                                    className="w-4 h-4 rounded border-primary text-primary focus:ring-primary"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className={`font-medium ${isCompleted ? 'text-muted-foreground line-through' : ''}`}>
                                                        {milestone.title}
                                                    </span>
                                                    {isCompleted && milestoneProgress[milestone.id]?.completed_at && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(milestoneProgress[milestone.id].completed_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{milestone.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {/* Submission Form */}
                    {(assignment.status === 'in_progress' || assignment.status === 'submitted') && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Submit Your Work</CardTitle>
                                <CardDescription>
                                    {assignment.status === 'submitted'
                                        ? 'Your submission has been received and is under review'
                                        : 'Provide links to your completed project'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {success && (
                                    <Alert className="mb-4">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <AlertDescription>
                                            Project submitted successfully! Redirecting...
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {error && (
                                    <Alert variant="destructive" className="mb-4">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="github_url">
                                            GitHub Repository URL <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="flex gap-2">
                                            <Github className="h-4 w-4 mt-3 text-muted-foreground" />
                                            <Input
                                                id="github_url"
                                                type="url"
                                                placeholder="https://github.com/username/repo"
                                                value={formData.github_url}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, github_url: e.target.value })
                                                }
                                                disabled={assignment.status === 'submitted'}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="demo_url">Live Demo URL (Optional)</Label>
                                        <div className="flex gap-2">
                                            <Globe className="h-4 w-4 mt-3 text-muted-foreground" />
                                            <Input
                                                id="demo_url"
                                                type="url"
                                                placeholder="https://your-demo.vercel.app"
                                                value={formData.demo_url}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, demo_url: e.target.value })
                                                }
                                                disabled={assignment.status === 'submitted'}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Any challenges, learnings, or notes about your implementation..."
                                            rows={4}
                                            value={formData.notes}
                                            onChange={(e) =>
                                                setFormData({ ...formData, notes: e.target.value })
                                            }
                                            disabled={assignment.status === 'submitted'}
                                        />
                                    </div>

                                    {assignment.status === 'in_progress' && (
                                        <Button type="submit" disabled={submitting} size="lg">
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Project'
                                            )}
                                        </Button>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Team Members */}
                    {teamMembers.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Team Members</CardTitle>
                                {assignment.team && (
                                    <CardDescription>{assignment.team.name}</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {teamMembers.map((tm) => (
                                    <div key={tm.user_id} className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                            {tm.profile.user_profile.full_name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{tm.profile.user_profile.full_name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{tm.role || 'Member'}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Deliverables (Moved to sidebar) */}
                    {assignment.project?.deliverables && assignment.project.deliverables.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Deliverables</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-1">
                                    {assignment.project.deliverables.map((item, idx) => (
                                        <li key={idx} className="text-sm text-muted-foreground">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}