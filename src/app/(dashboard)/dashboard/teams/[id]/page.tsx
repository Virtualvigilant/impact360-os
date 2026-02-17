'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Folder, Calendar, ArrowLeft, Mail, Github, Globe } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils/format';
import Link from 'next/link';

interface TeamMember {
    user_id: string;
    role: string;
    profile: {
        full_name: string;
        avatar_url?: string;
        email?: string;
    };
}

interface TeamProjectAssignment {
    id: string;
    status: string;
    started_at?: string;
    completed_at?: string;
    submitted_at?: string;
    milestone_progress?: Record<string, { status: 'pending' | 'completed'; completed_at?: string }>;
    project: {
        id: string;
        title: string;
        description: string;
        difficulty: string;
        deadline?: string;
        milestones: {
            id: string;
            title: string;
            description: string;
        }[];
    };
}

interface TeamDetails {
    id: string;
    name: string;
    created_at: string;
    members: TeamMember[];
    assignments: TeamProjectAssignment[];
}

export default function TeamDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { isAdmin, isMentor } = useAuth();
    const [team, setTeam] = useState<TeamDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchTeamDetails();
        }
    }, [params.id]);

    const fetchTeamDetails = async () => {
        const supabase = supabaseClient();
        try {
            // Fetch team basic info and members
            const { data: teamData, error: teamError } = await (supabase
                .from('teams') as any)
                .select(`
                    id,
                    name,
                    created_at,
                    members:team_members(
                        user_id,
                        role,
                        profile:profiles(full_name, avatar_url, email)
                    )
                `)
                .eq('id', params.id)
                .single();

            if (teamError) throw teamError;

            // Fetch distinct active assignments
            // Since assignments are per-member, we need to fetch one representative assignment per project for the team
            // We use the first one we find for the team_id
            const { data: assignmentsData, error: assignmentsError } = await (supabase
                .from('project_assignments') as any)
                .select(`
                    id,
                    status,
                    started_at,
                    completed_at,
                    submitted_at,
                    milestone_progress,
                    project:projects(
                        id,
                        title,
                        description,
                        difficulty,
                        deadline,
                        milestones
                    )
                `)
                .eq('team_id', params.id);

            if (assignmentsError) throw assignmentsError;

            // Deduplicate assignments by project ID to avoid showing the same project multiple times
            // (One assignment row per member, but they share the same state)
            const uniqueAssignments = Array.from(new Map(assignmentsData.map((item: any) => [item.project.id, item])).values());

            setTeam({
                ...teamData,
                assignments: uniqueAssignments
            } as any);

        } catch (error) {
            console.error('Error fetching team details:', error);
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

    if (!team) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/teams">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Teams
                    </Link>
                </Button>
                <div className="flex items-center justify-center h-64 border rounded-lg bg-card">
                    <p className="text-muted-foreground">Team not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild className="-ml-2">
                            <Link href="/dashboard/teams">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2 ml-8">
                        <Calendar className="h-4 w-4" />
                        Created {formatDate(team.created_at)}
                    </p>
                </div>
                {/* Future: Edit/Delete Team Actions */}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Projects */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold">Active Projects</h2>
                    {team.assignments.length > 0 ? (
                        team.assignments.map((assignment) => (
                            <Card key={assignment.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{assignment.project.title}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {assignment.project.description}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={assignment.status === 'completed' ? 'default' : 'secondary'}>
                                            {assignment.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Milestones Progress */}
                                    {assignment.project.milestones && assignment.project.milestones.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-muted-foreground">Progress</span>
                                                <span>
                                                    {Object.values(assignment.milestone_progress || {}).filter((m: any) => m.status === 'completed').length}
                                                    {' / '}
                                                    {assignment.project.milestones.length} Milestones
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{
                                                        width: `${(Object.values(assignment.milestone_progress || {}).filter((m: any) => m.status === 'completed').length / assignment.project.milestones.length) * 100}%`
                                                    }}
                                                />
                                            </div>

                                            {/* Milestone List (Collapsed or simple view) */}
                                            <div className="mt-4 grid gap-2">
                                                {assignment.project.milestones.map(m => {
                                                    const isCompleted = assignment.milestone_progress?.[m.id]?.status === 'completed';
                                                    return (
                                                        <div key={m.id} className="flex items-center gap-2 text-sm">
                                                            <div className={`h-2 w-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                            <span className={isCompleted ? 'text-muted-foreground line-through' : ''}>{m.title}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 text-sm text-muted-foreground pt-2">
                                        {assignment.started_at && (
                                            <div>Started: {formatDate(assignment.started_at)}</div>
                                        )}
                                        {assignment.submitted_at && (
                                            <div>Submitted: {formatDate(assignment.submitted_at)}</div>
                                        )}
                                        {/* Since admins view this, maybe add link to view submission if submitted */}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No active projects assigned to this team.
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Members */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Team Members</h2>
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {team.members.map((member) => (
                                    <div key={member.user_id} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={member.profile?.avatar_url} />
                                            <AvatarFallback>{getInitials(member.profile?.full_name || 'User')}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{member.profile?.full_name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/dashboard/members/${member.user_id}`}>
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
