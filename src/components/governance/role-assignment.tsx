'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { assignRole } from '@/lib/actions/governance';
import { APP_ROLES, ROLE_LABELS, type AppRole } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/**
 * Change a person's role.
 *
 * Two guards are mirrored from the database function so the interface never offers a
 * move it knows will be refused: nobody edits their own role, and only a super
 * administrator may grant or revoke super_admin.
 */
export function RoleAssignment({
    profileId,
    name,
    currentRole,
    isSelf,
    actorIsSuperAdmin,
}: {
    profileId: string;
    name: string;
    currentRole: AppRole;
    isSelf: boolean;
    actorIsSuperAdmin: boolean;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState<AppRole>(currentRole);
    const [reason, setReason] = useState('');
    const [pending, setPending] = useState(false);

    if (isSelf) {
        return (
            <span className="shrink-0 text-xs text-muted-foreground" title="You cannot change your own role">
                That is you
            </span>
        );
    }

    const targetIsSuperAdmin = currentRole === 'super_admin';
    if (targetIsSuperAdmin && !actorIsSuperAdmin) {
        return (
            <span className="shrink-0 text-xs text-muted-foreground">Super admin — requires a super admin</span>
        );
    }

    const assignable = APP_ROLES.filter((option) => actorIsSuperAdmin || option !== 'super_admin');

    async function submit() {
        setPending(true);
        const result = await assignRole({ profile_id: profileId, role, reason });
        setPending(false);

        if (result.ok) {
            toast.success(`${name} is now ${ROLE_LABELS[role].toLowerCase()}`);
            setOpen(false);
            setReason('');
            router.refresh();
        } else {
            toast.error(result.error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">
                    Change role
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change role for {name}</DialogTitle>
                    <DialogDescription>
                        This is recorded in the audit trail against your account, with the reason you give.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={`role-${profileId}`}>New role</Label>
                        <select
                            id={`role-${profileId}`}
                            value={role}
                            onChange={(event) => setRole(event.target.value as AppRole)}
                            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                        >
                            {assignable.map((option) => (
                                <option key={option} value={option}>
                                    {ROLE_LABELS[option]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`reason-${profileId}`}>Reason</Label>
                        <Textarea
                            id={`reason-${profileId}`}
                            rows={3}
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="Why does this person need this access?"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={submit} disabled={pending || reason.trim().length === 0 || role === currentRole}>
                        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                        Assign role
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
