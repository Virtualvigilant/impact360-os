'use client';

import { raiseConcern } from '@/lib/actions/development';
import { ActionForm, AreaField, CheckField, SelectField } from '@/components/primitives/action-form';

const CATEGORIES = [
    { value: 'workload', label: 'Workload' },
    { value: 'supervision', label: 'Supervision' },
    { value: 'conduct', label: 'Conduct' },
    { value: 'safety', label: 'Safety' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'discrimination', label: 'Discrimination' },
    { value: 'wellbeing', label: 'Wellbeing' },
    { value: 'access', label: 'Access or equipment' },
    { value: 'privacy', label: 'Privacy' },
    { value: 'other', label: 'Something else' },
];

export function RaiseConcernForm() {
    return (
        <ActionForm action={raiseConcern} submitLabel="Submit report" successMessage="Report submitted">
            {(errors) => (
                <>
                    <SelectField name="category" label="Category" errors={errors} defaultValue="workload" options={CATEGORIES} />
                    <AreaField name="summary" label="Summary" errors={errors} required rows={2} />
                    <AreaField name="details" label="What happened?" errors={errors} rows={6} />
                    <CheckField
                        name="is_anonymous"
                        label="Report this anonymously"
                        errors={errors}
                        hint="Your identity will not be recorded, so nobody will be able to come back to you with questions."
                    />
                </>
            )}
        </ActionForm>
    );
}
