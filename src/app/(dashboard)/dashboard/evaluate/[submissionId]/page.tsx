'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { Submission, ProjectAssignment } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Github, Globe, CheckCircle2, Star } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { EVALUATION_CRITERIA } from '@/lib/utils/constants';
import Link from 'next/link';

export default function EvaluatePage() {
  const params = useParams();
  const router = useRouter();
  const { profile, isMentor, isAdmin } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assignment, setAssignment] = useState<ProjectAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [scores, setScores] = useState({
    code_quality: 3,
    architecture: 3,
    problem_solving: 3,
    communication: 3,
    teamwork: 3,
    reliability: 3,
  });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (profile?.id && (isMentor || isAdmin) && params.submissionId) {
      fetchSubmissionData();
    }
  }, [profile?.id, isMentor, isAdmin, params.submissionId]);

  const fetchSubmissionData = async () => {
    if (!params.submissionId) return;

    const supabase = supabaseClient();

    try {
      // Fetch submission
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .select(`
          *,
          project:projects(*)
        `)
        .eq('id', params.submissionId)
        .single();

      if (submissionError) throw submissionError;
      if (submissionData) {
        setSubmission(submissionData);

        // Fetch assignment
        const { data: assignmentData } = await supabase
          .from('project_assignments')
          .select('*')
          .eq('id', submissionData.assignment_id)
          .single();

        if (assignmentData) setAssignment(assignmentData);
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    if (!submission || !profile?.id) return;

    const supabase = supabaseClient();

    try {
      // Create evaluation
      const { error: evalError } = await supabase.from('evaluations').insert({
        submission_id: submission.id,
        member_id: submission.member_id,
        evaluator_id: profile.id,
        ...scores,
        feedback: feedback || null,
      });

      if (evalError) throw evalError;

      // Update assignment status
      const { error: updateError } = await supabase
        .from('project_assignments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', submission.assignment_id);

      if (updateError) throw updateError;

      // Create notification for member
      await supabase.from('notifications').insert({
        user_id: submission.member_id,
        title: 'Project Evaluated',
        message: `Your project submission has been evaluated with an average score of ${
          Object.values(scores).reduce((a, b) => a + b, 0) / 6
        }/5`,
        type: 'evaluation',
        related_id: submission.id,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/members');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMentor && !isAdmin) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/members">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Submission not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / 6;

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/members">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Members
        </Link>
      </Button>

      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Evaluation submitted successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submission Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Submission</CardTitle>
          <CardDescription>
            Submitted on {formatDate(submission.submitted_at)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base">Project</Label>
            <p className="mt-1 font-medium">{submission.project?.title}</p>
            <p className="text-sm text-muted-foreground">{submission.project?.description}</p>
          </div>

          {/* Links */}
          <div className="flex gap-4">
            {submission.github_url && (
              <Button variant="outline" asChild>
                <a href={submission.github_url} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </a>
              </Button>
            )}
            {submission.demo_url && (
              <Button variant="outline" asChild>
                <a href={submission.demo_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" />
                  View Demo
                </a>
              </Button>
            )}
          </div>

          {/* Notes */}
          {submission.notes && (
            <div>
              <Label className="text-base">Member Notes</Label>
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                {submission.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evaluation Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Evaluate Submission</CardTitle>
            <CardDescription>
              Rate the member's performance on each criteria (1-5 scale)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Inputs */}
            {EVALUATION_CRITERIA.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={key}>{label}</Label>
                  <Badge variant="outline">{scores[key as keyof typeof scores]}/5</Badge>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={scores[key as keyof typeof scores] >= value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setScores({ ...scores, [key]: value })}
                      className="flex-1"
                    >
                      <Star className="h-4 w-4" fill={scores[key as keyof typeof scores] >= value ? 'currentColor' : 'none'} />
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            {/* Average Score Display */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Average Score</Label>
                <div className="text-3xl font-bold">{averageScore.toFixed(1)}/5</div>
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <Label htmlFor="feedback">Written Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Provide detailed feedback on strengths, areas for improvement, and suggestions..."
                rows={6}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Evaluation...
                </>
              ) : (
                'Submit Evaluation'
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}