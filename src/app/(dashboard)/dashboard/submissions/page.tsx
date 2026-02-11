'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { ProjectAssignment, Submission } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, CheckCircle2, Clock, FileText } from 'lucide-react';
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

interface SubmissionWithDetails extends Submission {
    assignment: ProjectAssignment & {
        project: { title: string; difficulty: string };
        member_profile: {
            profile: { full_name: string; email: string };
        };
    };
}

export default function SubmissionsPage() {
    const { profile, isAdmin, isMentor } = useAuth();
    const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.id && (isAdmin || isMentor)) {
            fetchSubmissions();
        }
    }, [profile?.id, isAdmin, isMentor]);

    const fetchSubmissions = async () => {
        const supabase = supabaseClient();

        try {
            // Fetch submissions where assignment status is 'submitted'
            // We'll fetch all submissions and filter, or use a clever join
            // Simpler: Fetch project_assignments with status 'submitted' and their submissions
            // But we need the submission ID for the evaluate link.

            // Let's fetch submissions and join assignments
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

            // The !inner join on project_assignments filters submissions where assignment meets criteria
            // However, Supabase syntax for nested filter might be tricky.
            // .eq('assignment.status', 'submitted') works if relation is named correctly.
            // Let's try client-side filtering if server-side is complex, but 'submitted' status is key.
            // Actually, querying submissions and filtering by joined assignment status is supported.

            if (data) {
                // Filter out any where assignment status isn't submitted (just in case)
                const pending = data.filter((s: any) => s.assignment.status === 'submitted');
                setSubmissions(pending);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Project Submissions</h1>
                    <p className="text-muted-foreground mt-2">
                        Review and evaluate pending project submissions
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Reviews ({submissions.length})</CardTitle>
                    <CardDescription>
                        Students waiting for feedback
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {submissions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500/50" />
                            <p>No pending submissions!</p>
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
                                            <div className="flex gap-2">
                                                {submission.github_url && (
                                                    <a
                                                        href={submission.github_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline flex items-center gap-1 text-sm"
                                                    >
                                                        GitHub <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" asChild>
                                                <Link href={`/dashboard/evaluate/${submission.id}`}>
                                                    Evaluate
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
