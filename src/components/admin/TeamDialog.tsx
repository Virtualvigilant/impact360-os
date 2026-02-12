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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Plus, Search } from 'lucide-react';
import { Profile } from '@/types/database.types';

interface Team {
    id: string;
    name: string;
    members: { user_id: string; role: string }[];
}

interface TeamDialogProps {
    initialData?: Team;
    onSuccess: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TeamDialog({ initialData, onSuccess, open, onOpenChange }: TeamDialogProps) {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [members, setMembers] = useState<Profile[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (open) {
            fetchMembers();
            if (initialData) {
                setName(initialData.name);
                setSelectedMemberIds(initialData.members.map((m) => m.user_id));
            } else {
                setName('');
                setSelectedMemberIds([]);
            }
        }
    }, [open, initialData]);

    const fetchMembers = async () => {
        const supabase = supabaseClient();
        // Fetch users who can be added to teams (e.g., students/members)
        // For simplicity, fetching all non-admin profiles or filtering by logic
        const { data } = await supabase
            .from('profiles')
            .select('*')
            // .in('role', ['member', 'student']) // Adjust roles as per your schema
            .order('full_name');
        if (data) setMembers(data);
    };

    const toggleMember = (id: string) => {
        setSelectedMemberIds((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const supabase = supabaseClient();

        try {
            let teamId = initialData?.id;

            if (initialData) {
                // Update Team Name
                const { error: updateError } = await (supabase
                    .from('teams') as any)
                    .update({ name })
                    .eq('id', initialData.id);
                if (updateError) throw updateError;
            } else {
                // Create Team
                // Create Team
                const { data: newTeam, error: insertError } = await (supabase
                    .from('teams') as any)
                    .insert({
                        name,
                        created_by: profile?.id,
                        is_active: true,
                    })
                    .select()
                    .single();
                if (insertError) throw insertError;
                teamId = newTeam.id;
            }

            // Sync Members
            // For simplicity in this demo: Delete all and re-insert (or smarter diffing)
            // But deleting all destroys metadata like 'joined_at' or specific roles if improperly handled.
            // Better strategy:
            // 1. Find to add
            // 2. Find to remove

            const currentMemberIds = initialData ? initialData.members.map(m => m.user_id) : [];
            const toAdd = selectedMemberIds.filter(id => !currentMemberIds.includes(id));
            const toRemove = currentMemberIds.filter(id => !selectedMemberIds.includes(id));

            if (toAdd.length > 0) {
                const { error: addError } = await (supabase
                    .from('team_members') as any)
                    .insert(
                        toAdd.map((userId) => ({
                            team_id: teamId,
                            user_id: userId,
                            role: 'member', // Default role
                        }))
                    );
                if (addError) throw addError;
            }

            if (toRemove.length > 0) {
                const { error: removeError } = await (supabase
                    .from('team_members') as any)
                    .delete()
                    .eq('team_id', teamId)
                    .in('user_id', toRemove);
                if (removeError) throw removeError;
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error saving team:', error?.message || JSON.stringify(error));
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(m =>
        m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Team' : 'Create New Team'}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Manage team details and members' : 'Create a new team and add members'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Team Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Alpha Squad"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Members</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search members..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {selectedMemberIds.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 my-2">
                                {selectedMemberIds.map((id) => {
                                    const member = members.find((m) => m.id === id);
                                    return (
                                        <Badge key={id} variant="secondary" className="gap-1">
                                            {member?.full_name || 'Unknown'}
                                            <button type="button" onClick={() => toggleMember(id)} className="ml-0.5 hover:text-destructive">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}

                        <div className="border rounded-md max-h-48 overflow-y-auto">
                            {filteredMembers.length === 0 ? (
                                <p className="text-sm text-muted-foreground p-3">No members found</p>
                            ) : (
                                filteredMembers.map((member) => (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => toggleMember(member.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors ${selectedMemberIds.includes(member.id) ? 'bg-primary/10' : ''}`}
                                    >
                                        <div className="h-2 w-2 rounded-full bg-primary" style={{ opacity: selectedMemberIds.includes(member.id) ? 1 : 0 }} />
                                        <div>
                                            <p className="font-medium">{member.full_name}</p>
                                            <p className="text-xs text-muted-foreground">{member.email}</p>
                                        </div>
                                        <Badge variant="outline" className="ml-auto text-xs capitalize">{member.role}</Badge>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {initialData ? 'Saving...' : 'Creating...'}
                            </>
                        ) : (
                            initialData ? 'Save Changes' : 'Create Team'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
