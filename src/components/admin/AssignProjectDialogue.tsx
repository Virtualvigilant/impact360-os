'use client';

import { useState, useEffect } from 'react';
import { CreateTeamDialog } from '@/components/teams/CreateTeamDialog';
import { supabaseClient } from '@/lib/supabase/client';
import { MemberProfile, Profile } from '@/types/database.types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { STAGE_LABELS, TRACK_LABELS } from '@/lib/utils/constants';

type MemberWithProfile = MemberProfile & {
    profile: Profile;
};

interface AssignProjectDialogProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectTitle: string;
}

export function AssignProjectDialog({
    isOpen,
    onClose,
    projectId,
    projectTitle,
}: AssignProjectDialogProps) {
    const [members, setMembers] = useState<MemberWithProfile[]>([]);
    const [selectedMember, setSelectedMember] = useState<string>('');
    const [teams, setTeams] = useState<any[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const [assignmentType, setAssignmentType] = useState<'individual' | 'team'>('individual');
    const [showCreateTeam, setShowCreateTeam] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
            fetchTeams();
        }
    }, [isOpen]);

    const fetchMembers = async () => {
        const supabase = supabaseClient();

        try {
            const { data, error } = await supabase
                .from('member_profiles')
                .select(`
          *,
          profile:profiles(*)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setMembers(data as MemberWithProfile[]);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const fetchTeams = async () => {
        const supabase = supabaseClient();
        try {
            const { data, error } = await supabase
                .from('teams')
                .select('*, members:team_members(count)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setTeams(data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const handleAssign = async () => {
        if (assignmentType === 'individual' && !selectedMember) return;
        if (assignmentType === 'team' && !selectedTeam) return;

        setLoading(true);
        const supabase = supabaseClient();

        try {
            if (assignmentType === 'individual') {
                // Check if already assigned
                const { data: existing } = await supabase
                    .from('project_assignments')
                    .select('*')
                    .eq('project_id', projectId)
                    .eq('member_id', selectedMember)
                    .single();

                if (existing) {
                    alert('This project is already assigned to this member');
                    setLoading(false);
                    return;
                }

                // Create assignment
                const { error } = await (supabase.from('project_assignments') as any).insert({
                    project_id: projectId,
                    member_id: selectedMember,
                    status: 'not_started',
                });

                if (error) throw error;

                // Create notification
                await (supabase.from('notifications') as any).insert({
                    user_id: selectedMember,
                    title: 'New Project Assigned',
                    message: `You've been assigned to project: ${projectTitle}`,
                    type: 'project_assignment',
                    related_id: projectId,
                });
            } else {
                // TEAM ASSIGNMENT
                // 1. Get all team members
                const { data: teamMembers, error: membersError } = await supabase
                    .from('team_members')
                    .select('user_id')
                    .eq('team_id', selectedTeam);

                if (membersError) throw membersError;
                if (!teamMembers || teamMembers.length === 0) {
                    alert('Selected team has no members.');
                    setLoading(false);
                    return;
                }

                // 2. Prepare assignments for all members
                const assignments = (teamMembers as any[]).map(tm => ({
                    project_id: projectId,
                    member_id: tm.user_id,
                    team_id: selectedTeam,
                    status: 'not_started',
                }));

                // 3. Upsert assignments (ignore if already assigned? or duplicates?) 
                // Using upsert to be safe, though ideally we'd check each.
                const { error: assignError } = await (supabase
                    .from('project_assignments') as any)
                    .upsert(assignments, { onConflict: 'project_id,member_id' });

                if (assignError) throw assignError;

                // 4. Update Team's active project (optional, if we tracked it on team level)

                // 5. Notify all members
                const notifications = (teamMembers as any[]).map(tm => ({
                    user_id: tm.user_id,
                    title: 'New Team Project Assigned',
                    message: `Your team has been assigned to project: ${projectTitle}`,
                    type: 'project_assignment',
                    related_id: projectId,
                }));

                await (supabase.from('notifications') as any).insert(notifications);
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setSelectedMember('');
                setSelectedTeam('');
            }, 2000);
        } catch (error) {
            console.error('Error assigning project:', (error as any).message || error);
            alert(`Failed to assign project: ${(error as any).message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Project</DialogTitle>
                        <DialogDescription>
                            Assign "{projectTitle}" to a member or a team.
                        </DialogDescription>
                    </DialogHeader>

                    {success ? (
                        <div className="py-8 text-center space-y-4">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                            <p className="text-lg font-medium">Project assigned successfully!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Assignment Type Toggle */}
                            <div className="flex p-1 bg-muted rounded-lg">
                                <button
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${assignmentType === 'individual' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    onClick={() => setAssignmentType('individual')}
                                >
                                    Individual
                                </button>
                                <button
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${assignmentType === 'team' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    onClick={() => setAssignmentType('team')}
                                >
                                    Team
                                </button>
                            </div>

                            {assignmentType === 'individual' ? (
                                <div className="space-y-2">
                                    <Label>Select Member</Label>
                                    <Select value={selectedMember} onValueChange={setSelectedMember}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {members.map((member) => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{member.profile.full_name}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {member.current_stage ? STAGE_LABELS[member.current_stage] : 'N/A'}
                                                        </Badge>
                                                        {member.track && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {TRACK_LABELS[member.track]}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Select Team</Label>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-auto p-0 text-xs"
                                            onClick={() => setShowCreateTeam(true)}
                                        >
                                            + Create New Team
                                        </Button>
                                    </div>
                                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a team" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teams.map((team) => (
                                                <SelectItem key={team.id} value={team.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{team.name}</span>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {team.members?.[0]?.count || 0} members
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Button onClick={handleAssign} disabled={(!selectedMember && !selectedTeam) || loading} className="w-full">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Assigning...
                                    </>
                                ) : (
                                    `Assign to ${assignmentType === 'individual' ? 'Member' : 'Team'}`
                                )}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <CreateTeamDialog
                isOpen={showCreateTeam}
                onClose={() => setShowCreateTeam(false)}
                onTeamCreated={(teamId: string) => {
                    fetchTeams(); // Refresh list
                    setSelectedTeam(teamId); // Auto-select new team
                    setAssignmentType('team');
                }}
            />
        </>
    );
}