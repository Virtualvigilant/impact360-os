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
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
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

    const handleAssign = async () => {
        if (!selectedMember) return;

        setLoading(true);

        const supabase = supabaseClient();

        try {
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
            const { error } = await supabase.from('project_assignments').insert({
                project_id: projectId,
                member_id: selectedMember,
                status: 'not_started',
            });

            if (error) throw error;

            // Create notification
            await supabase.from('notifications').insert({
                user_id: selectedMember,
                title: 'New Project Assigned',
                message: `You've been assigned to project: ${projectTitle}`,
                type: 'project_assignment',
                related_id: projectId,
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setSelectedMember('');
            }, 2000);
        } catch (error) {
            console.error('Error assigning project:', (error as any).message || error);
            alert(`Failed to assign project: ${(error as any).message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Project to Member</DialogTitle>
                    <DialogDescription>
                        Select a member to assign "{projectTitle}" to
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center space-y-4">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                        <p className="text-lg font-medium">Project assigned successfully!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
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

                        <Button onClick={handleAssign} disabled={!selectedMember || loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                'Assign Project'
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}