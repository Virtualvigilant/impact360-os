'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { MemberProfile, Profile } from '@/types/database.types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STAGE_LABELS, TRACK_LABELS } from '@/lib/utils/constants';

type MemberWithProfile = MemberProfile & {
    profile: Profile;
};

interface CreateTeamDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onTeamCreated: (teamId: string) => void;
}

export function CreateTeamDialog({
    isOpen,
    onClose,
    onTeamCreated,
}: CreateTeamDialogProps) {
    const [teamName, setTeamName] = useState('');
    const [members, setMembers] = useState<MemberWithProfile[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingMembers, setFetchingMembers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTeamName('');
            setSelectedMemberIds([]);
            fetchMembers();
        }
    }, [isOpen]);

    const fetchMembers = async () => {
        setFetchingMembers(true);
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
        } finally {
            setFetchingMembers(false);
        }
    };

    const toggleMemberSelection = (memberId: string) => {
        setSelectedMemberIds(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleCreate = async () => {
        if (!teamName.trim()) return;

        setLoading(true);
        const supabase = supabaseClient();

        try {
            // 1. Create Team
            const { data: team, error: teamError } = await (supabase
                .from('teams') as any)
                .insert({ name: teamName })
                .select()
                .single();

            if (teamError) throw teamError;

            // 2. Add Members if any selected
            if (selectedMemberIds.length > 0) {
                const teamMembers = selectedMemberIds.map(userId => ({
                    team_id: team.id,
                    user_id: userId,
                    role: 'member' // Default role
                }));

                const { error: membersError } = await (supabase
                    .from('team_members') as any)
                    .insert(teamMembers);

                if (membersError) throw membersError;
            }

            onTeamCreated(team.id);
            onClose();
        } catch (error) {
            console.error('Error creating team:', error);
            alert('Failed to create team. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>
                        Give your team a name and add members.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="team-name">Team Name</Label>
                        <Input
                            id="team-name"
                            placeholder="e.g. Alpha Squad, Project X Team"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Add Members (Optional)</Label>
                        <div className="border rounded-md h-60 flex flex-col">
                            <div className="p-2 border-b bg-muted/30">
                                <span className="text-xs text-muted-foreground font-medium">
                                    {selectedMemberIds.length} selected
                                </span>
                            </div>

                            {fetchingMembers ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <ScrollArea className="flex-1">
                                    <div className="p-2 space-y-1">
                                        {members.map((member) => {
                                            const isSelected = selectedMemberIds.includes(member.id);
                                            return (
                                                <div
                                                    key={member.id}
                                                    onClick={() => toggleMemberSelection(member.id)}
                                                    className={`
                                                        flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors
                                                        ${isSelected ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted'}
                                                    `}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{member.profile.full_name}</span>
                                                        <span className="text-xs text-muted-foreground capitalize">
                                                            {member.track ? TRACK_LABELS[member.track as keyof typeof TRACK_LABELS] : 'No Track'} • {STAGE_LABELS[member.current_stage as keyof typeof STAGE_LABELS]}
                                                        </span>
                                                    </div>
                                                    {isSelected && <UserPlus className="h-4 w-4 text-primary" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={!teamName.trim() || loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Team'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
