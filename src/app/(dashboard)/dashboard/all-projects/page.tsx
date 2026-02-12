'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { AssignProjectDialog } from '@/components/admin/AssignProjectDialogue';
import { Project } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, FolderKanban } from 'lucide-react';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, TRACK_LABELS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/format';
import {
    Dialog,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ProjectDialog } from '@/components/admin/ProjectDialog';

export default function AllProjectsPage() {
    const { profile, isAdmin, isMentor } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<{ id: string; title: string } | null>(null);
    const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

    useEffect(() => {
        if (profile?.id && (isAdmin || isMentor)) {
            fetchProjects();
        }
    }, [profile?.id, isAdmin, isMentor]);

    const fetchProjects = async () => {
        const supabase = supabaseClient();

        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (projectId: string) => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

        const supabase = supabaseClient();
        try {
            const { error } = await supabase.from('projects').delete().eq('id', projectId);
            if (error) throw error;
            fetchProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project. It may have associated assignments.');
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
                    <h1 className="text-3xl font-bold tracking-tight">All Projects</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and assign projects to members
                    </p>
                </div>
                {isAdmin && (
                    <>
                        <Button onClick={() => { setEditingProject(undefined); setProjectDialogOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Button>
                        <ProjectDialog
                            open={projectDialogOpen}
                            onOpenChange={setProjectDialogOpen}
                            initialData={editingProject}
                            onSuccess={() => {
                                fetchProjects();
                            }}
                        />
                    </>
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projects.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Beginner</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {projects.filter((p) => p.difficulty === 'beginner').length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Intermediate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {projects.filter((p) => p.difficulty === 'intermediate').length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Advanced</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {projects.filter((p) => p.difficulty === 'advanced').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
                {projects.length === 0 ? (
                    <Card>
                        <CardContent className="py-8">
                            <div className="text-center space-y-4">
                                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    No projects yet. Create one to get started.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    projects.map((project) => (
                        <Card key={project.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <CardTitle>{project.title}</CardTitle>
                                        <CardDescription>{project.description}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className={DIFFICULTY_COLORS[project.difficulty]}>
                                            {DIFFICULTY_LABELS[project.difficulty]}
                                        </Badge>
                                        <Badge variant="outline">{TRACK_LABELS[project.track]}</Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Tech Stack */}
                                {project.tech_stack && project.tech_stack.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">Tech Stack:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {project.tech_stack.map((tech, idx) => (
                                                <Badge key={idx} variant="secondary">
                                                    {tech}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Deliverables */}
                                {project.deliverables && project.deliverables.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">Deliverables:</p>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            {project.deliverables.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-4">
                                    <Button variant="outline" size="sm">
                                        View Details
                                    </Button>
                                    {isAdmin && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedProject({ id: project.id, title: project.title });
                                                    setAssignDialogOpen(true);
                                                }}
                                            >
                                                Assign to Member
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingProject(project);
                                                    setProjectDialogOpen(true);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(project.id)}
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
            {selectedProject && (
                <AssignProjectDialog
                    isOpen={assignDialogOpen}
                    onClose={() => setAssignDialogOpen(false)}
                    projectId={selectedProject.id}
                    projectTitle={selectedProject.title}
                />
            )}
        </div>
    );
}