'use client';

import type { ActionResult } from '@/lib/errors';
import { ActionForm, TextField } from '@/components/primitives/action-form';

export function ProfileForm({
    action,
    defaults,
}: {
    action: (input: unknown) => Promise<ActionResult<unknown>>;
    defaults: { full_name: string; phone: string; timezone: string; locale: string; avatar_url: string };
}) {
    return (
        <ActionForm action={action} submitLabel="Save profile" successMessage="Profile updated">
            {(errors) => (
                <>
                    <TextField name="full_name" label="Full name" errors={errors} required defaultValue={defaults.full_name} />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField name="phone" label="Phone" type="tel" errors={errors} defaultValue={defaults.phone} />
                        <TextField name="timezone" label="Timezone" errors={errors} defaultValue={defaults.timezone} />
                    </div>
                    <TextField
                        name="avatar_url"
                        label="Avatar URL"
                        type="url"
                        errors={errors}
                        defaultValue={defaults.avatar_url}
                    />
                    <input type="hidden" name="locale" value={defaults.locale} />
                </>
            )}
        </ActionForm>
    );
}
