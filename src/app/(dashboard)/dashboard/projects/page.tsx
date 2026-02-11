'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { ProjectAssignment, Submission } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ExternalLink, Calendar, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/lib/utils/constants';
import Link from 'next/link';

export default function ProjectsPage() {
    const { profile } = useAuth();
    const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.id) {
            fetchAssignments();
        }
    }, [profile?.id]);

    const fetchAssignments = async () => {
        if (!profile?.id) return;

        const supabase = supabaseClient();

        try {
            const { data, error } = await supabase
                .from('project_assignments')
                .select(`
          *,
          project:projects(*)
        `)
                .eq('member_id', profile.id)
                .order('assigned_at', { ascending: false });

            if (error) throw error;
            if (data) setAssignments(data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const notStarted = assignments.filter(a => a.status === 'not_started');
    const inProgress = assignments.filter(a => a.status === 'in_progress');
    const submitted = assignments.filter(a => a.status === 'submitted' || a.status === 'under_review');
    const completed = assignments.filter(a => a.status === 'completed');

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
                <p className="text-muted-foreground mt-2">
                    Track your assigned projects and submit your work
                </p>
            </div>

            <Tabs defaultValue="in-progress" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="in-progress">
                        In Progress ({inProgress.length})
                    </TabsTrigger>
                    <TabsTrigger value="not-started">
                        Not Started ({notStarted.length})
                    </TabsTrigger>
                    <TabsTrigger value="submitted">
                        Submitted ({submitted.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        Completed ({completed.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="in-progress" className="space-y-4">
                    {inProgress.length === 0 ? (
                        <Card>
                            <CardContent className="py-8">
                                <p className="text-center text-muted-foreground">
                                    No projects in progress
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        inProgress.map((assignment) => (
                            <ProjectCard key={assignment.id} assignment={assignment} onUpdate={fetchAssignments} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="not-started" className="space-y-4">
                    {notStarted.length === 0 ? (
                        <Card>
                            <CardContent className="py-8">
                                <p className="text-center text-muted-foreground">
                                    No projects waiting to start
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        notStarted.map((assignment) => (
                            <ProjectCard key={assignment.id} assignment={assignment} onUpdate={fetchAssignments} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="submitted" className="space-y-4">
                    {submitted.length === 0 ? (
                        <Card>
                            <CardContent className="py-8">
                                <p className="text-center text-muted-foreground">
                                    No submitted projects
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        submitted.map((assignment) => (
                            <ProjectCard key={assignment.id} assignment={assignment} onUpdate={fetchAssignments} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    {completed.length === 0 ? (
                        <Card>
                            <CardContent className="py-8">
                                <p className="text-center text-muted-foreground">
                                    No completed projects yet
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        completed.map((assignment) => (
                            <ProjectCard key={assignment.id} assignment={assignment} onUpdate={fetchAssignments} />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

interface ProjectCardProps {
    assignment: ProjectAssignment;
    onUpdate: () => void;
}

function ProjectCard({ assignment, onUpdate }: ProjectCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle>{assignment.project?.title}</CardTitle>
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
            <CardContent className="space-y-4">
                {/* Project Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Assigned: {formatDate(assignment.assigned_at)}</span>
                    </div>
                    {assignment.project?.deadline && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Deadline: {formatDate(assignment.project.deadline)}</span>
                        </div>
                    )}
                </div>

                {/* Tech Stack */}
                {assignment.project?.tech_stack && assignment.project.tech_stack.length > 0 && (
                    <div>
                        <p className="text-sm font-medium mb-2">Tech Stack:</p>
                        <div className="flex flex-wrap gap-2">
                            {assignment.project.tech_stack.map((tech, idx) => (
                                <Badge key={idx} variant="outline">
                                    {tech}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Deliverables */}
                {assignment.project?.deliverables && assignment.project.deliverables.length > 0 && (
                    <div>
                        <p className="text-sm font-medium mb-2">Deliverables:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {assignment.project.deliverables.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                    {assignment.status === 'not_started' && (
                        <Button asChild>
                            <Link href={`/dashboard/projects/${assignment.id}`}>
                                Start Project
                            </Link>
                        </Button>
                    )}
                    {assignment.status === 'in_progress' && (
                        <Button asChild>
                            <Link href={`/dashboard/projects/${assignment.id}`}>
                                Continue Working
                            </Link>
                        </Button>
                    )}
                    {(assignment.status === 'submitted' || assignment.status === 'under_review') && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/projects/${assignment.id}`}>
                                View Submissions
                            </Link>
                        </Button>
                    )}
                    {assignment.status === 'completed' && (
                        <Button variant="outline" asChild>
                            <Link href={`/dashboard/projects/${assignment.id}`}>
                                View Details
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}