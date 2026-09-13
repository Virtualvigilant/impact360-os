'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, CheckCircle2, Loader2, MoreHorizontal, PauseCircle, Pencil, PlayCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { updateProgramme, updateProgrammeStatus } from '@/lib/actions/recruitment';
import type { Tables } from '@/types/database';
import { ActionForm, AreaField, SelectField, TextField } from '@/components/primitives/action-form';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProgrammeActionsProps {
    programme: Tables<'internship_programmes'>;
}

export function ProgrammeActions({ programme }: ProgrammeActionsProps) {
    const router = useRouter();
    const [editOpen, setEditOpen] = useState(false);
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(false);

    async function handleStatusChange(status: Tables<'internship_programmes'>['status']) {
        setPendingStatus(true);
        const res = await updateProgrammeStatus({ id: programme.id, status });
        setPendingStatus(false);
        if (res.ok) {
            toast.success(`Programme marked as ${status}`);
            router.refresh();
        } else {
            toast.error(res.error);
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={pendingStatus}>
                        {pendingStatus ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                            <MoreHorizontal className="h-4 w-4" aria-hidden />
                        )}
                        <span className="sr-only">Open menu for {programme.name}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" aria-hidden />
                        Edit details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Lifecycle status</DropdownMenuLabel>
                    {programme.status !== 'active' && (
                        <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                            <PlayCircle className="mr-2 h-4 w-4 text-emerald-600" aria-hidden />
                            Mark as Active
                        </DropdownMenuItem>
                    )}
                    {programme.status !== 'open' && (
                        <DropdownMenuItem onClick={() => handleStatusChange('open')}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" aria-hidden />
                            Mark as Open
                        </DropdownMenuItem>
                    )}
                    {programme.status !== 'paused' && (
                        <DropdownMenuItem onClick={() => handleStatusChange('paused')}>
                            <PauseCircle className="mr-2 h-4 w-4 text-amber-600" aria-hidden />
                            Pause programme
                        </DropdownMenuItem>
                    )}
                    {programme.status !== 'completed' && (
                        <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-purple-600" aria-hidden />
                            Mark as Completed
                        </DropdownMenuItem>
                    )}
                    {programme.status !== 'draft' && (
                        <DropdownMenuItem onClick={() => handleStatusChange('draft')}>
                            <RotateCcw className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden />
                            Revert to Draft
                        </DropdownMenuItem>
                    )}
                    {programme.status !== 'archived' && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setArchiveOpen(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Archive className="mr-2 h-4 w-4" aria-hidden />
                                Archive programme
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Programme Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit programme</DialogTitle>
                        <DialogDescription>
                            Update the operating details for {programme.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <ActionForm
                        action={updateProgramme}
                        submitLabel="Save changes"
                        successMessage="Programme updated"
                        onSuccess={() => setEditOpen(false)}
                    >
                        {(errors) => (
                            <>
                                <input type="hidden" name="id" value={programme.id} />
                                <TextField
                                    name="name"
                                    label="Programme name"
                                    defaultValue={programme.name}
                                    errors={errors}
                                    required
                                />
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <TextField
                                        name="code"
                                        label="Code"
                                        defaultValue={programme.code}
                                        errors={errors}
                                        disabled
                                        hint="Unique code used in references."
                                    />
                                    <TextField
                                        name="cohort_label"
                                        label="Cohort"
                                        defaultValue={programme.cohort_label}
                                        errors={errors}
                                        required
                                        hint="e.g. January 2026 intake"
                                    />
                                </div>
                                <AreaField
                                    name="description"
                                    label="Purpose"
                                    defaultValue={programme.description ?? ''}
                                    errors={errors}
                                />
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <TextField
                                        name="start_date"
                                        label="Starts"
                                        type="date"
                                        defaultValue={programme.start_date}
                                        errors={errors}
                                        required
                                    />
                                    <TextField
                                        name="end_date"
                                        label="Ends"
                                        type="date"
                                        defaultValue={programme.end_date}
                                        errors={errors}
                                        required
                                    />
                                </div>
                                <div className="grid gap-5 sm:grid-cols-3">
                                    <TextField
                                        name="slots"
                                        label="Slots"
                                        type="number"
                                        defaultValue={programme.slots}
                                        errors={errors}
                                        required
                                    />
                                    <TextField
                                        name="expected_hours_per_week"
                                        label="Hours per week"
                                        type="number"
                                        defaultValue={programme.expected_hours_per_week}
                                        errors={errors}
                                        required
                                    />
                                    <SelectField
                                        name="work_arrangement"
                                        label="Arrangement"
                                        defaultValue={programme.work_arrangement}
                                        errors={errors}
                                        options={[
                                            { value: 'onsite', label: 'On site' },
                                            { value: 'hybrid', label: 'Hybrid' },
                                            { value: 'remote', label: 'Remote' },
                                        ]}
                                    />
                                </div>
                                <SelectField
                                    name="status"
                                    label="Lifecycle status"
                                    defaultValue={programme.status}
                                    errors={errors}
                                    options={[
                                        { value: 'draft', label: 'Draft' },
                                        { value: 'planned', label: 'Planned' },
                                        { value: 'open', label: 'Open (accepting applications)' },
                                        { value: 'active', label: 'Active (in progress)' },
                                        { value: 'paused', label: 'Paused' },
                                        { value: 'completed', label: 'Completed' },
                                        { value: 'archived', label: 'Archived' },
                                    ]}
                                />
                            </>
                        )}
                    </ActionForm>
                </DialogContent>
            </Dialog>

            {/* Archive Confirmation Dialog */}
            <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive {programme.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Archiving marks this cohort as concluded and removes it from active intake and opportunity
                            listings. All existing student placements, evaluations, attendance records, and evidence will
                            remain preserved for audit.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                handleStatusChange('archived');
                                setArchiveOpen(false);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Archive programme
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
