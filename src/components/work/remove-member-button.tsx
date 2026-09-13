'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { removeProjectMember } from '@/lib/actions/work';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface RemoveMemberButtonProps {
    projectId: string;
    placementId: string;
    memberName: string;
}

export function RemoveMemberButton({ projectId, placementId, memberName }: RemoveMemberButtonProps) {
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [open, setOpen] = useState(false);

    async function handleRemove() {
        setPending(true);
        const res = await removeProjectMember({ project_id: projectId, placement_id: placementId });
        setPending(false);
        if (res.ok) {
            toast.success(`Removed ${memberName} from project`);
            setOpen(false);
            router.refresh();
        } else {
            toast.error(res.error);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    title={`Remove ${memberName}`}
                >
                    <UserMinus className="h-4 w-4" />
                    <span className="sr-only">Remove {memberName}</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to remove <strong>{memberName}</strong> from this project? Their logged work, tasks and evidence will remain in the system.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleRemove();
                        }}
                        disabled={pending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Remove member
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
