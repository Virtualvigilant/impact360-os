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
            const { data: assignmentData, error: assignmentError } = await supabase
                .from('project_assignments')
                .select(`
          *,
          project:projects(*)
        `)
                .eq('id', params.id)
                .eq('member_id', profile.id)
                .single();

            if (assignmentError) throw assignmentError;
            if (assignmentData) {
                setAssignment(assignmentData);

                // Fetch submission if exists
                const { data: submissionData } = await supabase
                    .from('submissions')
                    .select('*')
                    .eq('assignment_id', assignmentData.id)
                    .order('submitted_at', { ascending: false })
                    .limit(1)
                    .single();

                if (submissionData) {
                    setSubmission(submissionData);
                    setFormData({
                        github_url: submissionData.github_url || '',
                        demo_url: submissionData.demo_url || '',
                        notes: submissionData.notes || '',
                    });

                    // Fetch evaluation
                    const { data: evaluationData } = await supabase
                        .from('evaluations')
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

    const handleStartProject = async () => {
        if (!assignment) return;

        const supabase = supabaseClient();

        try {
            const { error } = await supabase
                .from('project_assignments')
                .update({
                    status: 'in_progress',
                    started_at: new Date().toISOString(),
                })
                .eq('id', assignment.id);

            if (error) throw error;

            setAssignment({
                ...assignment,
                status: 'in_progress',
                started_at: new Date().toISOString(),
            });
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
            const { data: submissionData, error: submissionError } = await supabase
                .from('submissions')
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
            const { error: updateError } = await supabase
                .from('project_assignments')
                .update({
                    status: 'submitted',
                    submitted_at: new Date().toISOString(),
                })
                .eq('id', assignment.id);

            if (updateError) throw updateError;

            // Notify admins and mentors
            await notifyAdminsAndMentors(
                supabase,
                'New Project Submission',
                `${profile.full_name || 'A student'} has submitted their work for ${assignment.project?.title}`,
                'project_submission',
                submissionData.id
            );

            setSuccess(true);
            setSubmission(submissionData);
            setAssignment({
                ...assignment,
                status: 'submitted',
                submitted_at: new Date().toISOString(),
            });

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

    return (
        <div className="space-y-6">
            <Button variant="ghost" asChild>
                <Link href="/dashboard/projects">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                </Link>
            </Button>

            {/* Project Details */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">{assignment.project?.title}</CardTitle>
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

                    {/* Deliverables */}
                    {assignment.project?.deliverables && assignment.project.deliverables.length > 0 && (
                        <div>
                            <Label className="text-base">Deliverables</Label>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                {assignment.project.deliverables.map((item, idx) => (
                                    <li key={idx} className="text-muted-foreground">
                                        {item}
                                    </li>
                                ))}
                            </ul>
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

            {/* Evaluation Results */}
            {evaluation && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    Evaluation Results
                                </CardTitle>
                                <CardDescription>
                                    Evaluated on {formatDate(evaluation.evaluated_at)}
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-primary">
                                    {evaluation.average_score.toFixed(1)}/5
                                </div>
                                <div className="text-sm text-muted-foreground">Average Score</div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            {EVALUATION_CRITERIA.map(({ key, label }) => (
                                <div key={key} className="flex justify-between items-center p-3 bg-background rounded-lg border">
                                    <span className="font-medium">{label}</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-4 w-4 ${star <= (evaluation[key as keyof Evaluation] as number)
                                                        ? 'text-yellow-500 fill-yellow-500'
                                                        : 'text-muted-foreground/30'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {evaluation.feedback && (
                            <div className="bg-background p-4 rounded-lg border">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    Feedback
                                </h4>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {evaluation.feedback}
                                </p>
                            </div>
                        )}
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

                            {assignment.status === 'submitted' && submission && (
                                <div className="pt-4 space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Submitted on {formatDate(submission.submitted_at)}
                                    </p>
                                    {submission.github_url && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a
                                                href={submission.github_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Github className="mr-2 h-4 w-4" />
                                                View on GitHub
                                            </a>
                                        </Button>
                                    )}
                                    {submission.demo_url && (
                                        <Button variant="outline" size="sm" asChild className="ml-2">
                                            <a
                                                href={submission.demo_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Globe className="mr-2 h-4 w-4" />
                                                View Demo
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}