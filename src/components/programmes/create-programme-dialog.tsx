'use client';

import { Plus } from 'lucide-react';
import { createProgramme } from '@/lib/actions/recruitment';
import { ActionDialog, AreaField, SelectField, TextField } from '@/components/primitives/action-form';
import { Button } from '@/components/ui/button';

export function CreateProgrammeDialog() {
    return (
        <ActionDialog
            trigger={
                <Button>
                    <Plus className="mr-2 h-4 w-4" aria-hidden />
                    New programme
                </Button>
            }
            title="Create a programme"
            description="Start with the accountable operating record. Tracks, competencies, rubrics and completion requirements are added once it exists."
            action={createProgramme}
            submitLabel="Create programme"
            successMessage="Programme created"
        >
            {(errors) => (
                <>
                    <TextField name="name" label="Programme name" errors={errors} required />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField
                            name="code"
                            label="Code"
                            errors={errors}
                            required
                            hint="Capitals, numbers and hyphens — used in references."
                        />
                        <TextField
                            name="cohort_label"
                            label="Cohort"
                            errors={errors}
                            required
                            hint="e.g. January 2026 intake"
                        />
                    </div>
                    <AreaField name="description" label="Purpose" errors={errors} />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField name="start_date" label="Starts" type="date" errors={errors} required />
                        <TextField name="end_date" label="Ends" type="date" errors={errors} required />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-3">
                        <TextField name="slots" label="Slots" type="number" errors={errors} required defaultValue={10} />
                        <TextField
                            name="expected_hours_per_week"
                            label="Hours per week"
                            type="number"
                            errors={errors}
                            required
                            defaultValue={40}
                        />
                        <SelectField
                            name="work_arrangement"
                            label="Arrangement"
                            errors={errors}
                            defaultValue="hybrid"
                            options={[
                                { value: 'onsite', label: 'On site' },
                                { value: 'hybrid', label: 'Hybrid' },
                                { value: 'remote', label: 'Remote' },
                            ]}
                        />
                    </div>
                </>
            )}
        </ActionDialog>
    );
}
