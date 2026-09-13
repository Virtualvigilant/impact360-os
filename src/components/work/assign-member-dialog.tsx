'use client';

import { UserPlus } from 'lucide-react';
import { assignProjectMember } from '@/lib/actions/work';
import type { AvailableIntern } from '@/lib/data/work';
import { ActionDialog, SelectField, TextField } from '@/components/primitives/action-form';
import { Button } from '@/components/ui/button';

interface AssignMemberDialogProps {
    projectId: string;
    interns: AvailableIntern[];
}

export function AssignMemberDialog({ projectId, interns }: AssignMemberDialogProps) {
    const internOptions = interns.map((intern) => ({
        value: intern.id,
        label: `${intern.full_name} (${intern.email})${intern.isAssigned ? ' — Currently on team' : ''}`,
    }));

    return (
        <ActionDialog
            trigger={
                <Button size="sm" variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" aria-hidden />
                    Assign intern
                </Button>
            }
            title="Assign intern to project"
            description="Add an intern to this project team with their role and weekly allocation percentage."
            action={assignProjectMember}
            submitLabel="Assign to project"
            successMessage="Intern assigned to project"
        >
            {(errors) => (
                <>
                    <input type="hidden" name="project_id" value={projectId} />
                    {internOptions.length === 0 ? (
                        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                            No active intern profiles found. Interns will appear here once they register or their accounts are activated.
                        </p>
                    ) : (
                        <SelectField
                            name="intern_id"
                            label="Select intern"
                            errors={errors}
                            required
                            options={internOptions}
                            hint="Choose an intern from the registered cohort"
                        />
                    )}
                    <TextField
                        name="role_title"
                        label="Role / Title on project"
                        errors={errors}
                        placeholder="e.g. Lead Frontend Developer, Backend Engineer, QA Specialist"
                        hint="Descriptive title for their role in this project"
                    />
                    <TextField
                        name="allocation_percent"
                        label="Allocation (%)"
                        type="number"
                        defaultValue="100"
                        errors={errors}
                        required
                        hint="Percentage of working time allocated to this project (1–100%)"
                    />
                </>
            )}
        </ActionDialog>
    );
}
