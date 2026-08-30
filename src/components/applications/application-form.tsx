'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { submitApplication } from '@/lib/actions/public';
import { ActionForm, AreaField, CheckField, SelectField, TextField } from '@/components/primitives/action-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * The public application form.
 *
 * Consent is two separate checkboxes on purpose. Accepting the privacy notice is
 * required to apply at all; agreeing to be considered for future intakes is genuinely
 * optional. Bundling them would make the second one not freely given, and a consent
 * record that would not survive scrutiny is worse than no record.
 */
export function ApplicationForm({
    opportunityId,
    privacyNoticeVersion,
}: {
    opportunityId: string;
    privacyNoticeVersion: string;
}) {
    const [reference, setReference] = useState<string | null>(null);

    if (reference) {
        return (
            <Alert>
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                <AlertTitle>Application received</AlertTitle>
                <AlertDescription>
                    Your reference is <strong className="font-mono">{reference}</strong>. Keep it — quote it in any
                    correspondence about this application. ITEK will contact you at the email address you gave.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <ActionForm
            action={async (input) => {
                const result = await submitApplication(input);
                if (result.ok) setReference(result.data);
                return result;
            }}
            submitLabel="Submit application"
            successMessage="Application received"
            className="form-records space-y-8"
        >
            {(errors) => (
                <>
                    <input type="hidden" name="opportunity_id" value={opportunityId} />
                    <input type="hidden" name="privacy_notice_version" value={privacyNoticeVersion} />

                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField name="full_name" label="Full name" errors={errors} required />
                        <TextField name="email" label="Email" type="email" errors={errors} required />
                        <TextField name="phone" label="Phone" type="tel" errors={errors} />
                        <TextField name="location" label="Where are you based?" errors={errors} />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField name="institution" label="Institution" errors={errors} />
                        <TextField name="academic_programme" label="Course" errors={errors} />
                        <TextField name="academic_level" label="Year or level" errors={errors} />
                        <TextField
                            name="expected_graduation_date"
                            label="Expected graduation"
                            type="date"
                            errors={errors}
                        />
                    </div>

                    <AreaField
                        name="project_summary"
                        label="Tell us about something you have built"
                        errors={errors}
                        required
                        rows={5}
                        hint="What was it, what was your part in it, and what would you do differently? This matters more to us than a list of technologies."
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                        <AreaField name="skills" label="Skills" errors={errors} hint="One per line." />
                        <AreaField name="technologies" label="Technologies" errors={errors} hint="One per line." />
                    </div>

                    <AreaField
                        name="career_interests"
                        label="What areas interest you?"
                        errors={errors}
                        hint="One per line."
                    />

                    <div className="grid gap-5 sm:grid-cols-3">
                        <TextField name="portfolio_url" label="Portfolio" type="url" errors={errors} />
                        <TextField name="github_url" label="GitHub" type="url" errors={errors} />
                        <TextField name="linkedin_url" label="LinkedIn" type="url" errors={errors} />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-3">
                        <TextField name="available_from" label="Available from" type="date" errors={errors} />
                        <TextField
                            name="preferred_duration_weeks"
                            label="Preferred length (weeks)"
                            type="number"
                            errors={errors}
                        />
                        <SelectField
                            name="preferred_arrangement"
                            label="Preferred arrangement"
                            errors={errors}
                            options={[
                                { value: '', label: 'No preference' },
                                { value: 'onsite', label: 'On site' },
                                { value: 'hybrid', label: 'Hybrid' },
                                { value: 'remote', label: 'Remote' },
                            ]}
                        />
                    </div>

                    <AreaField
                        name="school_requirements"
                        label="Does your institution require anything specific?"
                        errors={errors}
                        hint="Attachment letters, logbooks, minimum weeks, assessment visits — tell us early so we can plan for it."
                    />

                    <div className="space-y-3 rounded-xl border p-4">
                        <p className="text-sm font-medium">Your data</p>
                        <CheckField
                            name="privacy_consent"
                            label={`I have read the ITEK privacy notice (version ${privacyNoticeVersion}) and agree to ITEK processing this application.`}
                            errors={errors}
                        />
                        <CheckField
                            name="screening_consent"
                            label="Optional: ITEK may keep my details to tell me about future intakes."
                            errors={errors}
                            hint="You can decline this and still apply. You can withdraw it later."
                        />
                    </div>
                </>
            )}
        </ActionForm>
    );
}
