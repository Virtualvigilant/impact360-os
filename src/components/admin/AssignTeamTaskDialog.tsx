'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase/client';
import { getInitials } from '@/lib/utils/format';

interface TeamMemberOption {
    user_id: string;
    role: string;
    profile: {
        full_name: string;
        avatar_url?: string;
    };
}

interface AssignTeamTaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    teamName: string;
    members: TeamMemberOption[];
    onTaskCreated: () => void;
}

export function AssignTeamTaskDialog({
    isOpen,
    onClose,
    teamId,
    teamName,
    members,
    onTaskCreated,
}: AssignTeamTaskDialogProps) {
    const [assignedTo, setAssignedTo] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleClose = () => {
        setAssignedTo('');
        setTitle('');
        setDescription('');
        setDueDate('');
        setSuccess(false);
        onClose();
    };

    const handleSubmit = async () => {
        if (!assignedTo || !title.trim()) return;

        setLoading(true);
        const supabase = supabaseClient();

        try {
            // Get current user (admin)
            const { data: { user } } = await supabase.auth.getUser();

            // Insert the task
            const { data: task, error: taskError } = await (supabase
                .from('team_tasks') as any)
                .insert({
                    team_id: teamId,
                    title: title.trim(),
                    description: description.trim() || null,
                    assigned_to: assignedTo,
                    status: 'not_started',
                    due_date: dueDate ? new Date(dueDate).toISOString() : null,
                    created_by: user?.id,
                })
                .select()
                .single();

            if (taskError) throw taskError;

            // Notify the assigned member
            const member = members.find(m => m.user_id === assignedTo);
            await (supabase.from('notifications') as any).insert({
                user_id: assignedTo,
                title: 'New Task Assigned',
                message: `You've been assigned a new task in ${teamName}: "${title.trim()}"`,
                type: 'task_assignment',
                related_id: task?.id,
            });

            setSuccess(true);
            setTimeout(() => {
                handleClose();
                onTaskCreated();
            }, 1500);
        } catch (error) {
            console.error('Error assigning task:', error);
            alert(`Failed to assign task: ${(error as any).message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Task</DialogTitle>
                    <DialogDescription>
                        Assign a specific task to a member of {teamName}.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center space-y-4">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                        <p className="text-lg font-medium">Task assigned successfully!</p>
                    </div>
                ) : (
                    <div className="space-y-4 mt-2">
                        {/* Member Selection */}
                        <div className="space-y-2">
                            <Label>Assign To</Label>
                            <Select value={assignedTo} onValueChange={setAssignedTo}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a team member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map((member) => (
                                        <SelectItem key={member.user_id} value={member.user_id}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={member.profile?.avatar_url} />
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(member.profile?.full_name || 'User')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>{member.profile?.full_name}</span>
                                                <span className="text-xs text-muted-foreground capitalize">({member.role})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Task Title */}
                        <div className="space-y-2">
                            <Label htmlFor="task-title">Task Title</Label>
                            <Input
                                id="task-title"
                                placeholder="e.g. Build the frontend UI"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="task-desc">Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Textarea
                                id="task-desc"
                                placeholder="Provide details about what needs to be done..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2">
                            <Label htmlFor="due-date">Due Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Input
                                id="due-date"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleSubmit}
                                disabled={!assignedTo || !title.trim() || loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Assigning...
                                    </>
                                ) : (
                                    'Assign Task'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
