'use client';

import { Plus } from 'lucide-react';
import { createProject } from '@/lib/actions/work';
import { ActionDialog, AreaField, SelectField, TextField } from '@/components/primitives/action-form';
import { Button } from '@/components/ui/button';

export function CreateProjectDialog() {
    return (
        <ActionDialog
            trigger={
                <Button>
                    <Plus className="mr-2 h-4 w-4" aria-hidden />
                    New project
                </Button>
            }
            title="Create a project"
            description="The objective is the part that matters — it is what tasks, evidence and evaluations later refer back to."
            action={createProject}
            submitLabel="Create project"
            successMessage="Project created"
        >
            {(errors) => (
                <>
                    <TextField name="name" label="Project name" errors={errors} required />
                    <TextField
                        name="code"
                        label="Code"
                        errors={errors}
                        required
                        hint="Capitals, numbers and hyphens — appears on every task."
                    />
                    <AreaField
                        name="objective"
                        label="Objective"
                        errors={errors}
                        required
                        hint="What will be true when this is done that is not true now?"
                    />
                    <AreaField name="description" label="Context" errors={errors} rows={4} />
                    <div className="grid gap-5 sm:grid-cols-3">
                        <TextField name="start_date" label="Starts" type="date" errors={errors} />
                        <TextField name="target_end_date" label="Target end" type="date" errors={errors} />
                        <SelectField
                            name="status"
                            label="Status"
                            errors={errors}
                            defaultValue="planned"
                            options={[
                                { value: 'planned', label: 'Planned' },
                                { value: 'active', label: 'Active' },
                                { value: 'on_hold', label: 'On hold' },
                            ]}
                        />
                    </div>
                </>
            )}
        </ActionDialog>
    );
}
