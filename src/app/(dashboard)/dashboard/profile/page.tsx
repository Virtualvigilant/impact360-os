import { UserRound } from 'lucide-react';
import { requireSession } from '@/lib/auth/session';
import { ROLE_LABELS } from '@/lib/auth/roles';
import { updateOwnProfile } from '@/lib/actions/governance';
import { formatDate } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { ProfileForm } from '@/components/governance/profile-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Your profile · ITEK Internship OS' };

export default async function ProfilePage() {
    const session = await requireSession('/dashboard/profile');
    const { profile } = session;

    return (
        <div className="mx-auto max-w-3xl space-y-7">
            <PageHeader
                eyebrow="Account"
                title="Your profile"
                description="Identity and contact information used across your ITEK professional record."
                icon={UserRound}
            />

            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <CardTitle>Personal information</CardTitle>
                            <CardDescription>
                                Your role and placement are set by ITEK, not here — every role change is recorded against
                                the administrator who made it.
                            </CardDescription>
                        </div>
                        <Badge variant="secondary">{ROLE_LABELS[session.role]}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ProfileForm
                        action={updateOwnProfile}
                        defaults={{
                            full_name: profile.full_name,
                            phone: profile.phone ?? '',
                            timezone: profile.timezone,
                            locale: profile.locale,
                            avatar_url: profile.avatar_url ?? '',
                        }}
                    />

                    <dl className="grid gap-4 rounded-lg bg-muted/60 p-4 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-xs text-muted-foreground">Email</dt>
                            <dd className="mt-1 font-medium">{profile.email}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">Account created</dt>
                            <dd className="mt-1 font-medium">{formatDate(profile.created_at)}</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>
        </div>
    );
}
