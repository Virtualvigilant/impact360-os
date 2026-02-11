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
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function AllProjectsPage() {
    const { profile, isAdmin, isMentor } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<{ id: string; title: string } | null>(null);

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
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Project
                            </Button>
                        </DialogTrigger>
                        <CreateProjectDialog
                            onSuccess={() => {
                                setCreateDialogOpen(false);
                                fetchProjects();
                            }}
                        />
                    </Dialog>
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
                                            <Button variant="outline" size="sm">
                                                Edit
                                            </Button>
                                        </>
                                    )}
                                    {selectedProject && (
                                        <AssignProjectDialog
                                            isOpen={assignDialogOpen}
                                            onClose={() => setAssignDialogOpen(false)}
                                            projectId={selectedProject.id}
                                            projectTitle={selectedProject.title}
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

function CreateProjectDialog({ onSuccess }: { onSuccess: () => void }) {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: '',
        track: '',
        tech_stack: '',
        deliverables: '',
        deadline: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const supabase = supabaseClient();

        try {
            const { error } = await supabase.from('projects').insert({
                title: formData.title,
                description: formData.description,
                difficulty: formData.difficulty,
                track: formData.track,
                tech_stack: formData.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
                deliverables: formData.deliverables.split('\n').map((s) => s.trim()).filter(Boolean),
                deadline: formData.deadline || null,
                is_active: true,
                created_by: profile?.id,
            });

            if (error) throw error;
            onSuccess();
        } catch (error) {
            console.error('Error creating project:', (error as any).message || error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                    Define a new project for members to work on
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                        id="title"
                        placeholder="e.g., Build a Todo App"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                        id="description"
                        placeholder="Detailed project description..."
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty *</Label>
                        <Select
                            value={formData.difficulty}
                            onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="track">Track *</Label>
                        <Select
                            value={formData.track}
                            onValueChange={(value) => setFormData({ ...formData, track: value })}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select track" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="web_development">Web Development</SelectItem>
                                <SelectItem value="ai_ml">AI & Machine Learning</SelectItem>
                                <SelectItem value="design">UI/UX Design</SelectItem>
                                <SelectItem value="mobile">Mobile Development</SelectItem>
                                <SelectItem value="devops">DevOps Engineering</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tech_stack">Tech Stack (comma-separated)</Label>
                    <Input
                        id="tech_stack"
                        placeholder="e.g., React, TypeScript, Tailwind CSS"
                        value={formData.tech_stack}
                        onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="deliverables">Deliverables (one per line)</Label>
                    <Textarea
                        id="deliverables"
                        placeholder="e.g., Working GitHub repository&#10;Deployed demo link&#10;README documentation"
                        rows={4}
                        value={formData.deliverables}
                        onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline (Optional)</Label>
                    <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        'Create Project'
                    )}
                </Button>
            </form>
        </DialogContent>
    );
}