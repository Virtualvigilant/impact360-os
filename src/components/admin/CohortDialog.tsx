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
import { Badge } from '@/components/ui/badge';
import { Loader2, X, UserCheck } from 'lucide-react';
import { Cohort, Profile } from '@/types/database.types';

interface CohortDialogProps {
    initialData?: Cohort;
    onSuccess: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CohortDialog({ initialData, onSuccess, open, onOpenChange }: CohortDialogProps) {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [mentors, setMentors] = useState<Profile[]>([]);
    const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        track: '',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        if (open) {
            fetchMentors();
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    description: initialData.description || '',
                    track: initialData.track,
                    start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '',
                    end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
                });
                setSelectedMentorIds(initialData.mentor_ids || []);
            } else {
                // Reset form for create mode
                setFormData({
                    name: '',
                    description: '',
                    track: '',
                    start_date: '',
                    end_date: '',
                });
                setSelectedMentorIds([]);
            }
        }
    }, [open, initialData]);

    const fetchMentors = async () => {
        const supabase = supabaseClient();
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .in('role', ['mentor', 'admin'])
            .order('full_name');
        if (data) setMentors(data);
    };

    const toggleMentor = (id: string) => {
        setSelectedMentorIds((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const supabase = supabaseClient();

        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                track: formData.track,
                start_date: formData.start_date,
                end_date: formData.end_date || null,
                is_active: true, // Default to true, or keep existing? Usually edit doesn't change active status here, but let's keep it simple.
                mentor_ids: selectedMentorIds.length > 0 ? selectedMentorIds : null,
            };

            let error;

            if (initialData) {
                // Update
                const { error: updateError } = await (supabase
                    .from('cohorts') as any)
                    .update(payload)
                    .eq('id', initialData.id);
                error = updateError;
            } else {
                // Create
                const { error: insertError } = await (supabase
                    .from('cohorts') as any)
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
            console.error('Error saving cohort:', error?.message || JSON.stringify(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Cohort' : 'Create New Cohort'}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update cohort details' : 'Set up a new cohort for batch training'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Cohort Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Web Dev Cohort Q1 2026"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Brief description of the cohort..."
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
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

                    {/* Mentor Assignment */}
                    <div className="space-y-2">
                        <Label>Assign Mentors</Label>
                        {selectedMentorIds.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {selectedMentorIds.map((id) => {
                                    const mentor = mentors.find((m) => m.id === id);
                                    return (
                                        <Badge key={id} variant="secondary" className="gap-1">
                                            {mentor?.full_name}
                                            <button type="button" onClick={() => toggleMentor(id)} className="ml-0.5 hover:text-destructive">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}
                        <div className="border rounded-md max-h-32 overflow-y-auto">
                            {mentors.length === 0 ? (
                                <p className="text-sm text-muted-foreground p-3">No mentors found</p>
                            ) : (
                                mentors.map((mentor) => (
                                    <button
                                        key={mentor.id}
                                        type="button"
                                        onClick={() => toggleMentor(mentor.id)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors ${selectedMentorIds.includes(mentor.id) ? 'bg-primary/10 text-primary' : ''
                                            }`}
                                    >
                                        <UserCheck className={`h-4 w-4 ${selectedMentorIds.includes(mentor.id) ? 'text-primary' : 'text-muted-foreground'
                                            }`} />
                                        <span>{mentor.full_name}</span>
                                        <Badge variant="outline" className="ml-auto text-xs capitalize">{mentor.role}</Badge>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Start Date *</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_date">End Date (Optional)</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {initialData ? 'Saving...' : 'Creating...'}
                            </>
                        ) : (
                            initialData ? 'Save Changes' : 'Create Cohort'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
