'use client';

import { Plus } from 'lucide-react';
import { createTask } from '@/lib/actions/work';
import type { Tables } from '@/types/database';
import { ActionDialog, AreaField, SelectField, TextField } from '@/components/primitives/action-form';
import { Button } from '@/components/ui/button';

export function CreateTaskDialog({ programmes }: { programmes: Tables<'internship_programmes'>[] }) {
    return (
        <ActionDialog
            trigger={
                <Button>
                    <Plus className="mr-2 h-4 w-4" aria-hidden />
                    New task
                </Button>
            }
            title="Create a task"
            description="Start with the objective and how you will know it is done. A task without acceptance criteria cannot be reviewed fairly."
            action={createTask}
            submitLabel="Create task"
            successMessage="Task created"
        >
            {(errors) => (
                <>
                    <TextField name="title" label="Title" errors={errors} required />
                    <AreaField
                        name="objective"
                        label="Objective"
                        errors={errors}
                        hint="What is this work for? Connect it to the project or learning goal."
                    />
                    <AreaField
                        name="acceptance_criteria"
                        label="Acceptance criteria"
                        errors={errors}
                        rows={4}
                        hint="One per line. These are what the reviewer will check against."
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <SelectField
                            name="priority"
                            label="Priority"
                            errors={errors}
                            defaultValue="medium"
                            options={[
                                { value: 'low', label: 'Low' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'high', label: 'High' },
                                { value: 'urgent', label: 'Urgent' },
                            ]}
                        />
                        <TextField name="due_at" label="Due" type="datetime-local" errors={errors} />
                    </div>
                    <TextField
                        name="estimated_hours"
                        label="Estimated hours"
                        type="number"
                        errors={errors}
                        hint="Used to check whether an intern's week is realistic."
                    />
                    {programmes.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                            No open programmes yet. The task will start in the backlog until it is assigned to a placement.
                        </p>
                    )}
                </>
            )}
        </ActionDialog>
    );
}
