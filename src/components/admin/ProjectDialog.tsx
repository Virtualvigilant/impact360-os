'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Project } from '@/types/database.types';

interface ProjectDialogProps {
    initialData?: Project;
    onSuccess: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProjectDialog({ initialData, onSuccess, open, onOpenChange }: ProjectDialogProps) {
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

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    title: initialData.title,
                    description: initialData.description,
                    difficulty: initialData.difficulty,
                    track: initialData.track,
                    tech_stack: initialData.tech_stack?.join(', ') || '',
                    deliverables: initialData.deliverables?.join('\n') || '',
                    deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
                });
            } else {
                setFormData({
                    title: '',
                    description: '',
                    difficulty: '',
                    track: '',
                    tech_stack: '',
                    deliverables: '',
                    deadline: '',
                });
            }
        }
    }, [open, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const supabase = supabaseClient();

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                difficulty: formData.difficulty,
                track: formData.track,
                tech_stack: formData.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
                deliverables: formData.deliverables.split('\n').map((s) => s.trim()).filter(Boolean),
                deadline: formData.deadline || null,
                is_active: true,
            };

            let error;

            if (initialData) {
                const { error: updateError } = await (supabase
                    .from('projects') as any)
                    .update(payload)
                    .eq('id', initialData.id);
                error = updateError;
            } else {
                const { error: insertError } = await (supabase
                    .from('projects') as any)
                    .insert({
                        ...payload,
                        created_by: profile?.id,
                    });
                error = insertError;
            }

            if (error) throw error;
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error saving project:', error?.message || JSON.stringify(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update project requirements' : 'Define a new project for members to work on'}
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
                                {initialData ? 'Saving...' : 'Creating...'}
                            </>
                        ) : (
                            initialData ? 'Save Changes' : 'Create Project'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
