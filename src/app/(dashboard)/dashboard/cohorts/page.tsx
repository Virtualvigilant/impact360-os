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
    DialogTrigger,
} from '@/components/ui/dialog';
import { CohortDialog } from '@/components/admin/CohortDialog';


export default function CohortsPage() {
    const { profile, isAdmin, isMentor } = useAuth();
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCohort, setSelectedCohort] = useState<Cohort | undefined>(undefined);

    useEffect(() => {
        if (profile?.id && (isAdmin || isMentor)) {
            fetchCohorts();
        }
    }, [profile?.id, isAdmin, isMentor]);

    const fetchCohorts = async () => {
        const supabase = supabaseClient();

        try {
            const { data, error } = await (supabase
                .from('cohorts') as any)
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

    const handleDelete = async (cohortId: string) => {
        if (!confirm('Are you sure you want to delete this cohort? This action cannot be undone.')) return;

        const supabase = supabaseClient();
        try {
            const { error } = await (supabase.from('cohorts') as any).delete().eq('id', cohortId);
            if (error) throw error;
            fetchCohorts();
        } catch (error) {
            console.error('Error deleting cohort:', error);
            alert('Failed to delete cohort. It may have associated members.');
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
                    <>
                        <Button onClick={() => { setSelectedCohort(undefined); setDialogOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Cohort
                        </Button>
                        <CohortDialog
                            open={dialogOpen}
                            onOpenChange={setDialogOpen}
                            initialData={selectedCohort}
                            onSuccess={() => {
                                fetchCohorts();
                            }}
                        />
                    </>
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
                            <CohortCard
                                key={cohort.id}
                                cohort={cohort}
                                onEdit={(c) => { setSelectedCohort(c); setDialogOpen(true); }}
                                onDelete={() => handleDelete(cohort.id)}
                                isAdmin={isAdmin}
                            />
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
                            <CohortCard
                                key={cohort.id}
                                cohort={cohort}
                                onEdit={(c) => { setSelectedCohort(c); setDialogOpen(true); }}
                                onDelete={() => handleDelete(cohort.id)}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function CohortCard({ cohort, onEdit, onDelete, isAdmin }: { cohort: Cohort, onEdit: (c: Cohort) => void, onDelete: () => void, isAdmin: boolean }) {
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
        const { count } = await (supabase
            .from('member_profiles') as any)
            .select('*', { count: 'exact', head: true })
            .eq('cohort_id', cohort.id);

        setMemberCount(count || 0);
    };

    const fetchMentorNames = async () => {
        const supabase = supabaseClient();
        const { data } = await (supabase
            .from('profiles') as any)
            .select('full_name')
            .in('id', cohort.mentor_ids!);
        if (data) setMentorNames(data.map((p: any) => p.full_name));
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

                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                        <Link href={`/dashboard/cohorts/${cohort.id}`}>View Details</Link>
                    </Button>
                    {isAdmin && (
                        <>
                            <Button variant="ghost" size="icon" onClick={() => onEdit(cohort)}>
                                <span className="sr-only">Edit</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete}>
                                <span className="sr-only">Delete</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}