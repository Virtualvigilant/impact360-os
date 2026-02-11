'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { Cohort, Profile } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Users, Calendar, UserCheck, X } from 'lucide-react';
import { TRACK_LABELS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/format';
import Link from 'next/link';
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

export default function CohortsPage() {
    const { profile, isAdmin, isMentor } = useAuth();
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    useEffect(() => {
        if (profile?.id && (isAdmin || isMentor)) {
            fetchCohorts();
        }
    }, [profile?.id, isAdmin, isMentor]);

    const fetchCohorts = async () => {
        const supabase = supabaseClient();

        try {
            const { data, error } = await supabase
                .from('cohorts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) {
                // Mentors only see cohorts they're assigned to
                if (isMentor && !isAdmin) {
                    setCohorts(data.filter((c: Cohort) => c.mentor_ids?.includes(profile!.id)));
                } else {
                    setCohorts(data);
                }
            }
        } catch (error) {
            console.error('Error fetching cohorts:', error);
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

    const activeCohorts = cohorts.filter((c) => c.is_active);
    const inactiveCohorts = cohorts.filter((c) => !c.is_active);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cohorts</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage learning cohorts and batch training
                    </p>
                </div>
                {isAdmin && (
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Cohort
                            </Button>
                        </DialogTrigger>
                        <CreateCohortDialog
                            onSuccess={() => {
                                setCreateDialogOpen(false);
                                fetchCohorts();
                            }}
                        />
                    </Dialog>
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Cohorts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{cohorts.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Active Cohorts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCohorts.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inactiveCohorts.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Cohorts */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Active Cohorts</h2>
                {activeCohorts.length === 0 ? (
                    <Card>
                        <CardContent className="py-8">
                            <p className="text-center text-muted-foreground">
                                No active cohorts. Create one to get started.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {activeCohorts.map((cohort) => (
                            <CohortCard key={cohort.id} cohort={cohort} />
                        ))}
                    </div>
                )}
            </div>

            {/* Inactive Cohorts */}
            {inactiveCohorts.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Completed Cohorts</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {inactiveCohorts.map((cohort) => (
                            <CohortCard key={cohort.id} cohort={cohort} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function CohortCard({ cohort }: { cohort: Cohort }) {
    const [memberCount, setMemberCount] = useState(0);
    const [mentorNames, setMentorNames] = useState<string[]>([]);

    useEffect(() => {
        fetchMemberCount();
        if (cohort.mentor_ids && cohort.mentor_ids.length > 0) {
            fetchMentorNames();
        }
    }, [cohort.id]);

    const fetchMemberCount = async () => {
        const supabase = supabaseClient();
        const { count } = await supabase
            .from('member_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('cohort_id', cohort.id);

        setMemberCount(count || 0);
    };

    const fetchMentorNames = async () => {
        const supabase = supabaseClient();
        const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .in('id', cohort.mentor_ids!);
        if (data) setMentorNames(data.map((p) => p.full_name));
    };

    return (
        <Card className={!cohort.is_active ? 'opacity-60' : ''}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>{cohort.name}</CardTitle>
                        <CardDescription className="mt-1">{cohort.description}</CardDescription>
                    </div>
                    <Badge variant={cohort.is_active ? 'default' : 'secondary'}>
                        {cohort.is_active ? 'Active' : 'Completed'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">{TRACK_LABELS[cohort.track]}</Badge>
                    <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {memberCount} members
                    </span>
                </div>

                {mentorNames.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserCheck className="h-4 w-4 shrink-0" />
                        <span className="truncate">{mentorNames.join(', ')}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-medium">{formatDate(cohort.start_date)}</p>
                    </div>
                    {cohort.end_date && (
                        <div>
                            <p className="text-muted-foreground">End Date</p>
                            <p className="font-medium">{formatDate(cohort.end_date)}</p>
                        </div>
                    )}
                </div>

                <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/cohorts/${cohort.id}`}>View Details</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

function CreateCohortDialog({ onSuccess }: { onSuccess: () => void }) {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [mentors, setMentors] = useState<Profile[]>([]);
    const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        track: '',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        fetchMentors();
    }, []);

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
            const { error } = await supabase.from('cohorts').insert({
                name: formData.name,
                description: formData.description,
                track: formData.track,
                start_date: formData.start_date,
                end_date: formData.end_date || null,
                is_active: true,
                created_by: profile?.id,
                mentor_ids: selectedMentorIds.length > 0 ? selectedMentorIds : null,
            });

            if (error) throw error;
            onSuccess();
        } catch (error: any) {
            console.error('Error creating cohort:', error?.message || JSON.stringify(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Create New Cohort</DialogTitle>
                <DialogDescription>
                    Set up a new cohort for batch training
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
                            Creating...
                        </>
                    ) : (
                        'Create Cohort'
                    )}
                </Button>
            </form>
        </DialogContent>
    );
}