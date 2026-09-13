'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, CheckCircle2, Eye, EyeOff, Loader2, MoreHorizontal, Pencil, RotateCcw, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { updateOpportunity, updateOpportunityStatus } from '@/lib/actions/recruitment';
import type { OpportunityRow } from '@/lib/data/programmes';
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

interface OpportunityActionsProps {
    opportunity: OpportunityRow;
    programmes: Tables<'internship_programmes'>[];
}

export function OpportunityActions({ opportunity, programmes }: OpportunityActionsProps) {
    const router = useRouter();
    const [editOpen, setEditOpen] = useState(false);
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(false);

    async function handleStatusChange(status: Tables<'opportunities'>['status']) {
        setPendingStatus(true);
        const res = await updateOpportunityStatus({ id: opportunity.id, status });
        setPendingStatus(false);
        if (res.ok) {
            toast.success(`Opportunity marked as ${status}`);
            router.refresh();
        } else {
            toast.error(res.error);
        }
    }

    const defaultOpensAt = opportunity.opens_at ? opportunity.opens_at.slice(0, 16) : '';
    const defaultClosesAt = opportunity.closes_at ? opportunity.closes_at.slice(0, 16) : '';

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
                        <span className="sr-only">Open actions for {opportunity.title}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" aria-hidden />
                        Edit details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Lifecycle status</DropdownMenuLabel>
                    {opportunity.status !== 'published' && (
                        <DropdownMenuItem onClick={() => handleStatusChange('published')}>
                            <Eye className="mr-2 h-4 w-4 text-emerald-600" aria-hidden />
                            Publish listing
                        </DropdownMenuItem>
                    )}
                    {opportunity.status !== 'closed' && (
                        <DropdownMenuItem onClick={() => handleStatusChange('closed')}>
                            <XCircle className="mr-2 h-4 w-4 text-amber-600" aria-hidden />
                            Mark as Closed
                        </DropdownMenuItem>
                    )}
                    {opportunity.status !== 'filled' && (
                        <DropdownMenuItem onClick={() => handleStatusChange('filled')}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-purple-600" aria-hidden />
                            Mark as Filled
                        </DropdownMenuItem>
                    )}
                    {opportunity.status !== 'draft' && (
                        <DropdownMenuItem onClick={() => handleStatusChange('draft')}>
                            <RotateCcw className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden />
                            Return to Draft
                        </DropdownMenuItem>
                    )}
                    {opportunity.status !== 'archived' && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setArchiveOpen(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Archive className="mr-2 h-4 w-4" aria-hidden />
                                Archive opportunity
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Opportunity Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit opportunity</DialogTitle>
                        <DialogDescription>
                            Update the position details, responsibilities, and schedule.
                        </DialogDescription>
                    </DialogHeader>
                    <ActionForm
                        action={updateOpportunity}
                        submitLabel="Save changes"
                        successMessage="Opportunity updated"
                        onSuccess={() => setEditOpen(false)}
                    >
                        {(errors) => (
                            <>
                                <input type="hidden" name="id" value={opportunity.id} />
                                <SelectField
                                    name="programme_id"
                                    label="Programme"
                                    defaultValue={opportunity.programme_id}
                                    errors={errors}
                                    options={programmes.map((programme) => ({
                                        value: programme.id,
                                        label: `${programme.name} · ${programme.cohort_label}`,
                                    }))}
                                />
                                <TextField
                                    name="title"
                                    label="Title"
                                    defaultValue={opportunity.title}
                                    errors={errors}
                                    required
                                />
                                <AreaField
                                    name="summary"
                                    label="Summary"
                                    defaultValue={opportunity.summary}
                                    errors={errors}
                                    required
                                    hint="What this person will actually work on. Candidates read this first."
                                />
                                <AreaField
                                    name="responsibilities"
                                    label="Responsibilities"
                                    defaultValue={opportunity.responsibilities?.join('\n') ?? ''}
                                    errors={errors}
                                    rows={4}
                                    hint="One per line."
                                />
                                <AreaField
                                    name="qualifications"
                                    label="Qualifications"
                                    defaultValue={opportunity.qualifications?.join('\n') ?? ''}
                                    errors={errors}
                                    rows={4}
                                    hint="One per line."
                                />
                                <div className="grid gap-5 sm:grid-cols-3">
                                    <SelectField
                                        name="work_arrangement"
                                        label="Arrangement"
                                        defaultValue={opportunity.work_arrangement}
                                        errors={errors}
                                        options={[
                                            { value: 'onsite', label: 'On site' },
                                            { value: 'hybrid', label: 'Hybrid' },
                                            { value: 'remote', label: 'Remote' },
                                        ]}
                                    />
                                    <TextField
                                        name="location"
                                        label="Location"
                                        defaultValue={opportunity.location ?? ''}
                                        errors={errors}
                                    />
                                    <TextField
                                        name="slots"
                                        label="Slots"
                                        type="number"
                                        defaultValue={opportunity.slots}
                                        errors={errors}
                                        required
                                    />
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <TextField
                                        name="opens_at"
                                        label="Applications open"
                                        type="datetime-local"
                                        defaultValue={defaultOpensAt}
                                        errors={errors}
                                    />
                                    <TextField
                                        name="closes_at"
                                        label="Applications close"
                                        type="datetime-local"
                                        defaultValue={defaultClosesAt}
                                        errors={errors}
                                    />
                                </div>
                                <SelectField
                                    name="status"
                                    label="Lifecycle status"
                                    defaultValue={opportunity.status}
                                    errors={errors}
                                    options={[
                                        { value: 'draft', label: 'Draft' },
                                        { value: 'published', label: 'Published' },
                                        { value: 'closed', label: 'Closed' },
                                        { value: 'filled', label: 'Filled' },
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
                        <AlertDialogTitle>Archive {opportunity.title}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Archiving removes this opportunity from the public catalogue and closes it to incoming applications.
                            All existing applications, applicant reviews, and interview records remain preserved.
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
                            Archive opportunity
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
