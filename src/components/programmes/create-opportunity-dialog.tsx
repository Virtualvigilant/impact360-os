'use client';

import { Plus } from 'lucide-react';
import { createOpportunity } from '@/lib/actions/recruitment';
import type { Tables } from '@/types/database';
import { ActionDialog, AreaField, SelectField, TextField } from '@/components/primitives/action-form';
import { Button } from '@/components/ui/button';

export function CreateOpportunityDialog({ programmes }: { programmes: Tables<'internship_programmes'>[] }) {
    return (
        <ActionDialog
            trigger={
                <Button disabled={programmes.length === 0}>
                    <Plus className="mr-2 h-4 w-4" aria-hidden />
                    New opportunity
                </Button>
            }
            title="Create an opportunity"
            description="It is created as a draft. Publishing is a separate, deliberate step — and it is what makes the public application form live."
            action={createOpportunity}
            submitLabel="Create draft"
            successMessage="Opportunity created as a draft"
        >
            {(errors) => (
                <>
                    <SelectField
                        name="programme_id"
                        label="Programme"
                        errors={errors}
                        options={programmes.map((programme) => ({
                            value: programme.id,
                            label: `${programme.name} · ${programme.cohort_label}`,
                        }))}
                    />
                    <TextField name="title" label="Title" errors={errors} required />
                    <AreaField
                        name="summary"
                        label="Summary"
                        errors={errors}
                        required
                        hint="What this person will actually work on. Candidates read this first."
                    />
                    <AreaField
                        name="responsibilities"
                        label="Responsibilities"
                        errors={errors}
                        rows={4}
                        hint="One per line."
                    />
                    <AreaField
                        name="qualifications"
                        label="Qualifications"
                        errors={errors}
                        rows={4}
                        hint="One per line. Be honest about what is genuinely required versus nice to have."
                    />
                    <div className="grid gap-5 sm:grid-cols-3">
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
                        <TextField name="location" label="Location" errors={errors} />
                        <TextField name="slots" label="Slots" type="number" errors={errors} required defaultValue={1} />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField name="opens_at" label="Applications open" type="datetime-local" errors={errors} />
                        <TextField name="closes_at" label="Applications close" type="datetime-local" errors={errors} />
                    </div>
                </>
            )}
        </ActionDialog>
    );
}
