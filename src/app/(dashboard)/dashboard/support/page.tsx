import { LifeBuoy } from 'lucide-react';
import { requireSession } from '@/lib/auth/session';
import { PageHeader } from '@/components/primitives/page-header';
import { RaiseConcernForm } from '@/components/governance/raise-concern-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Support · ITEK Internship OS' };

export default async function SupportPage() {
    await requireSession('/dashboard/support');

    return (
        <div className="mx-auto max-w-2xl space-y-7">
            <PageHeader
                eyebrow="Support"
                title="Raise a concern"
                description="Workload, conduct, safety, supervision, wellbeing or anything else that is getting in the way of a good internship."
                icon={LifeBuoy}
            />

            <Alert>
                <AlertTitle>How anonymous reports work</AlertTitle>
                <AlertDescription>
                    If you choose to report anonymously, no reporter identity is stored against the record — not hidden,
                    genuinely not written. That means nobody can follow up with you directly, so include anything that
                    matters in the report itself. Concerns are visible only to programme administrators.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>Your report</CardTitle>
                    <CardDescription>
                        Be as specific as you can — what happened, when, and who was involved if you are comfortable saying.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RaiseConcernForm />
                </CardContent>
            </Card>
        </div>
    );
}
