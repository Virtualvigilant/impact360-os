'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { Cohort, MemberProfile, Profile } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Loader2,
    ArrowLeft,
    Users,
    UserPlus,
    Calendar,
    UserCheck,
    Search,
    X,
    Mail,
} from 'lucide-react';
import { TRACK_LABELS, STAGE_LABELS, STAGE_COLORS } from '@/lib/utils/constants';
import { formatDate, getInitials } from '@/lib/utils/format';
import Link from 'next/link';

type MemberWithProfile = MemberProfile & { profile: Profile };

export default function CohortDetailPage() {
    const params = useParams();
    const { profile, isAdmin, isMentor } = useAuth();
    const [cohort, setCohort] = useState<Cohort | null>(null);
    const [members, setMembers] = useState<MemberWithProfile[]>([]);
    const [mentorNames, setMentorNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    const isCohortMember = profile?.id && members.some((m) => m.id === profile.id);
    const canView = isAdmin || isMentor || isCohortMember;

    useEffect(() => {
        if (params.id && profile?.id) {
            fetchCohortData();
        }
    }, [params.id, profile?.id]);

    const fetchCohortData = async () => {
        const supabase = supabaseClient();
        const cohortId = params.id as string;

        try {
            // Fetch cohort
            const { data: cohortData, error: cohortError } = await (supabase
                .from('cohorts') as any)
                .select('*')
                .eq('id', cohortId)
                .single();

            if (cohortError) throw cohortError;
            if (cohortData) setCohort(cohortData);

            // Fetch members in this cohort
            const { data: membersData } = await (supabase
                .from('member_profiles') as any)
                .select('*, profile:profiles(*)')
                .eq('cohort_id', cohortId)
                .order('created_at', { ascending: false });

            if (membersData) setMembers(membersData as MemberWithProfile[]);

            // Fetch mentor names
            if (cohortData?.mentor_ids && cohortData.mentor_ids.length > 0) {
                const { data: mentorsData } = await (supabase
                    .from('profiles') as any)
                    .select('full_name')
                    .in('id', cohortData.mentor_ids as string[]);
                if (mentorsData) setMentorNames(mentorsData.map((m: any) => m.full_name));
            }
        } catch (error) {
            console.error('Error fetching cohort:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeMember = async (memberId: string) => {
        const supabase = supabaseClient();
        try {
            const { error } = await (supabase
                .from('member_profiles') as any)
                .update({ cohort_id: null })
                .eq('id', memberId);

            if (error) throw error;
            setMembers((prev) => prev.filter((m) => m.id !== memberId));
        } catch (error: any) {
            console.error('Error removing member:', error?.message || error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!cohort) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/cohorts">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Cohorts
                    </Link>
                </Button>
                <Card>
                    <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">Cohort not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!canView) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/cohorts">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Cohorts
                    </Link>
                </Button>
                <Card>
                    <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">
                            You don't have access to this cohort.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" asChild>
                <Link href="/dashboard/cohorts">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Cohorts
                </Link>
            </Button>

            {/* Cohort Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">{cohort.name}</CardTitle>
                            {cohort.description && (
                                <CardDescription className="text-base">{cohort.description}</CardDescription>
                            )}
                        </div>
                        <Badge variant={cohort.is_active ? 'default' : 'secondary'}>
                            {cohort.is_active ? 'Active' : 'Completed'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-6 text-sm">
                        <div>
                            <p className="text-muted-foreground">Track</p>
                            <Badge variant="outline" className="mt-1">{TRACK_LABELS[cohort.track]}</Badge>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p className="font-medium flex items-center gap-1 mt-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(cohort.start_date)}
                            </p>
                        </div>
                        {cohort.end_date && (
                            <div>
                                <p className="text-muted-foreground">End Date</p>
                                <p className="font-medium flex items-center gap-1 mt-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {formatDate(cohort.end_date)}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-muted-foreground">Members</p>
                            <p className="font-medium flex items-center gap-1 mt-1">
                                <Users className="h-3.5 w-3.5" />
                                {members.length}
                            </p>
                        </div>
                        {mentorNames.length > 0 && (
                            <div>
                                <p className="text-muted-foreground">Mentors</p>
                                <p className="font-medium flex items-center gap-1 mt-1">
                                    <UserCheck className="h-3.5 w-3.5" />
                                    {mentorNames.join(', ')}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Members Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Members ({members.length})</CardTitle>
                        {isAdmin && (
                            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add Members
                                    </Button>
                                </DialogTrigger>
                                <AddMemberDialog
                                    cohortId={cohort.id}
                                    existingMemberIds={members.map((m) => m.id)}
                                    onMembersAdded={() => {
                                        setAddDialogOpen(false);
                                        fetchCohortData();
                                    }}
                                />
                            </Dialog>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {members.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6">
                            No members in this cohort yet.
                            {isAdmin && ' Click "Add Members" to get started.'}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage
                                                src={member.profile?.avatar_url}
                                                alt={member.profile?.full_name}
                                            />
                                            <AvatarFallback>
                                                {getInitials(member.profile?.full_name || '')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <Link
                                                href={`/dashboard/members/${member.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {member.profile?.full_name}
                                            </Link>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Mail className="h-3 w-3" />
                                                {member.profile?.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className={
                                                member.current_stage ? STAGE_COLORS[member.current_stage] : ''
                                            }
                                        >
                                            {STAGE_LABELS[member.current_stage]}
                                        </Badge>
                                        {isAdmin && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeMember(member.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// --- Add Member Dialog ---

function AddMemberDialog({
    cohortId,
    existingMemberIds,
    onMembersAdded,
}: {
    cohortId: string;
    existingMemberIds: string[];
    onMembersAdded: () => void;
}) {
    const [search, setSearch] = useState('');
    const [availableMembers, setAvailableMembers] = useState<MemberWithProfile[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAvailableMembers();
    }, []);

    const fetchAvailableMembers = async () => {
        const supabase = supabaseClient();
        try {
            // Get members not already in this cohort
            const { data } = await (supabase
                .from('member_profiles') as any)
                .select('*, profile:profiles(*)')
                .order('created_at', { ascending: false });

            if (data) {
                const filtered = (data as MemberWithProfile[]).filter(
                    (m) => !existingMemberIds.includes(m.id)
                );
                setAvailableMembers(filtered);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMember = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleAdd = async () => {
        if (selectedIds.length === 0) return;
        setSaving(true);
        const supabase = supabaseClient();

        try {
            // Update cohort_id for each selected member
            const { error } = await (supabase
                .from('member_profiles') as any)
                .update({ cohort_id: cohortId })
                .in('id', selectedIds);

            if (error) throw error;

            // Send notifications
            const notifications = selectedIds.map((id) => ({
                user_id: id,
                title: 'Added to Cohort',
                message: 'You have been added to a new cohort.',
                type: 'stage_change',
            }));
            await (supabase.from('notifications') as any).insert(notifications);

            onMembersAdded();
        } catch (error: any) {
            console.error('Error adding members:', error?.message || error);
        } finally {
            setSaving(false);
        }
    };

    const filteredMembers = availableMembers.filter((m) =>
        m.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.profile?.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Add Members to Cohort</DialogTitle>
                <DialogDescription>
                    Select members to add. {selectedIds.length > 0 && `${selectedIds.length} selected`}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Selected chips */}
                {selectedIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {selectedIds.map((id) => {
                            const member = availableMembers.find((m) => m.id === id);
                            return (
                                <Badge key={id} variant="secondary" className="gap-1">
                                    {member?.profile?.full_name}
                                    <button onClick={() => toggleMember(id)} className="ml-0.5 hover:text-destructive">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            );
                        })}
                    </div>
                )}

                {/* Member List */}
                <div className="border rounded-md max-h-64 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            {search ? 'No members match your search' : 'No available members to add'}
                        </p>
                    ) : (
                        filteredMembers.map((member) => (
                            <button
                                key={member.id}
                                type="button"
                                onClick={() => toggleMember(member.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors ${selectedIds.includes(member.id) ? 'bg-primary/10' : ''
                                    }`}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.profile?.avatar_url} />
                                    <AvatarFallback className="text-xs">
                                        {getInitials(member.profile?.full_name || '')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{member.profile?.full_name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{member.profile?.email}</p>
                                </div>
                                <Badge variant="outline" className="text-xs shrink-0">
                                    {STAGE_LABELS[member.current_stage]}
                                </Badge>
                            </button>
                        ))
                    )}
                </div>

                {/* Add Button */}
                <Button
                    onClick={handleAdd}
                    disabled={selectedIds.length === 0 || saving}
                    className="w-full"
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding...
                        </>
                    ) : (
                        `Add ${selectedIds.length} Member${selectedIds.length !== 1 ? 's' : ''}`
                    )}
                </Button>
            </div>
        </DialogContent>
    );
}
