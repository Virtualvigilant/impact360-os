'use client';

import { Plus } from 'lucide-react';
import { submitCheckIn } from '@/lib/actions/development';
import { ActionDialog, AreaField, SelectField, TextField } from '@/components/primitives/action-form';
import { Button } from '@/components/ui/button';

/** Monday of the current week, so the default period is the week being reflected on. */
function currentWeek() {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: monday.toISOString().slice(0, 10), end: sunday.toISOString().slice(0, 10) };
}

export function SubmitCheckInDialog({ placementId }: { placementId: string }) {
    const week = currentWeek();

    return (
        <ActionDialog
            trigger={
                <Button>
                    <Plus className="mr-2 h-4 w-4" aria-hidden />
                    Weekly check-in
                </Button>
            }
            title="Reflect on your week"
            description="Be specific. This record is what your mentor uses to remove blockers, and it becomes part of the narrative of your internship."
            action={submitCheckIn}
            submitLabel="Submit to mentor"
            successMessage="Check-in submitted"
        >
            {(errors) => (
                <>
                    <input type="hidden" name="placement_id" value={placementId} />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField name="period_start" label="Week from" type="date" errors={errors} required defaultValue={week.start} />
                        <TextField name="period_end" label="Week to" type="date" errors={errors} required defaultValue={week.end} />
                    </div>
                    <AreaField name="achievements" label="What did you accomplish?" errors={errors} required />
                    <AreaField name="learning" label="What did you learn?" errors={errors} required />
                    <AreaField
                        name="blockers"
                        label="What blocked you?"
                        errors={errors}
                        hint="Naming a blocker is not a complaint — it is the main thing your mentor can act on."
                    />
                    <AreaField name="next_steps" label="What are you doing next?" errors={errors} required />
                    <AreaField name="support_needed" label="What support do you need?" errors={errors} />
                    <SelectField
                        name="wellbeing_rating"
                        label="How was this week for you?"
                        errors={errors}
                        defaultValue="3"
                        options={[
                            { value: '1', label: '1 — Struggling' },
                            { value: '2', label: '2 — Difficult' },
                            { value: '3', label: '3 — Manageable' },
                            { value: '4', label: '4 — Good' },
                            { value: '5', label: '5 — Very good' },
                        ]}
                    />
                </>
            )}
        </ActionDialog>
    );
}
