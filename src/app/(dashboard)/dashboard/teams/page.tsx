'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Folder, Calendar, Plus } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils/format';
import Link from 'next/link';
import { TeamDialog } from '@/components/admin/TeamDialog';

interface Team {
    id: string;
    name: string;
    created_at: string;
    members: {
        user_id: string;
        role: string;
        profile: {
            full_name: string;
            avatar_url?: string;
        }
    }[];
    assignments: {
        project: {
            title: string;
        }
    }[];
}

export default function TeamsPage() {
    const { isAdmin, isMentor } = useAuth();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);

    useEffect(() => {
        if (isAdmin || isMentor) {
            fetchTeams();
        }
    }, [isAdmin, isMentor]);

    const fetchTeams = async () => {
        const supabase = supabaseClient();
        try {
            const { data: teamsData, error } = await (supabase
                .from('teams') as any)
                .select(`
                    *,
                    members:team_members(
                        user_id,
                        role,
                        profile:profiles(full_name, avatar_url)
                    ),
                    assignments:project_assignments(
                        status,
                        project:projects(title)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Process to deduplicate projects and filter active ones
            const processedTeams = teamsData?.map((team: any) => {
                const activeProjectTitles = Array.from(new Set(
                    team.assignments
                        .filter((a: any) => a.status !== 'completed' && a.status !== 'rejected')
                        .map((a: any) => a.project?.title)
                        .filter(Boolean)
                ));

                return {
                    ...team,
                    assignments: activeProjectTitles.map(title => ({ project: { title } }))
                };
            }) || [];

            setTeams(processedTeams as any);
        } catch (error) {
            console.error('Error fetching teams:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (teamId: string) => {
        if (!confirm('Are you sure you want to delete this team? This will remove all member associations and project assignments.')) return;

        const supabase = supabaseClient();
        try {
            const { error } = await (supabase.from('teams') as any).delete().eq('id', teamId);
            if (error) throw error;
            fetchTeams();
        } catch (error) {
            console.error('Error deleting team:', error);
            alert('Failed to delete team.');
        }
    };

    if (!isAdmin && !isMentor) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">You don't have permission to view this page.</p>
            </div>
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
                    <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and oversee all project teams.
                    </p>
                </div>
                {isAdmin && (
                    <>
                        <Button onClick={() => { setSelectedTeam(undefined); setDialogOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Team
                        </Button>
                        <TeamDialog
                            open={dialogOpen}
                            onOpenChange={setDialogOpen}
                            initialData={selectedTeam}
                            onSuccess={() => {
                                fetchTeams();
                            }}
                        />
                    </>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                    <Card key={team.id} className="flex flex-col">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>
                                        <Link href={`/dashboard/teams/${team.id}`} className="hover:underline hover:text-primary transition-colors">
                                            {team.name}
                                        </Link>
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1 mt-1">
                                        <Calendar className="h-3 w-3" />
                                        Created {formatDate(team.created_at)}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {team.members.length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4 flex flex-col">
                            {/* Active Projects */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                                    Current Projects
                                </h4>
                                {team.assignments.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {team.assignments.map((a, i) => (
                                            <Badge key={i} variant="secondary">
                                                <Folder className="h-3 w-3 mr-1" />
                                                {a.project.title}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No active projects</p>
                                )}
                            </div>

                            {/* Members */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                                    Members
                                </h4>
                                <div className="flex items-center -space-x-2 overflow-hidden">
                                    {team.members.slice(0, 5).map((member) => (
                                        <Avatar key={member.user_id} className="h-8 w-8 border-2 border-background">
                                            <AvatarImage src={member.profile?.avatar_url} />
                                            <AvatarFallback className="text-xs">
                                                {getInitials(member.profile?.full_name || 'User')}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {team.members.length > 5 && (
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-background bg-muted text-xs font-medium">
                                            +{team.members.length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto pt-4 flex gap-2">
                                <Button variant="outline" className="flex-1" asChild>
                                    <Link href={`/dashboard/teams/${team.id}`}>View Details</Link>
                                </Button>
                                {isAdmin && (
                                    <>
                                        <Button variant="ghost" size="icon" onClick={() => { setSelectedTeam(team); setDialogOpen(true); }}>
                                            <span className="sr-only">Edit</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(team.id)}>
                                            <span className="sr-only">Delete</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {teams.length === 0 && (
                <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-medium">No teams found</h3>
                    <p className="text-muted-foreground mb-4">Teams will appear here once created.</p>
                    {isAdmin && (
                        <Button onClick={() => { setSelectedTeam(undefined); setDialogOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create First Team
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
