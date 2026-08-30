import Link from 'next/link';
import { BriefcaseBusiness, GraduationCap } from 'lucide-react';
import type { AlumniDashboard } from '@/lib/data/command-center';
import { formatDate } from '@/lib/utils/format';
import { EmptyState } from '@/components/primitives/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AlumniCommandCenter({ data }: { data: AlumniDashboard }) {
    return (
        <div className="space-y-7">
            <Card>
                <CardHeader>
                    <CardTitle>Your ITEK record</CardTitle>
                    <CardDescription>
                        Kept with your consent, and used only to tell you about opportunities you opted into.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {data.profile ? (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" aria-hidden />
                                <span className="text-sm">
                                    {data.profile.current_title && data.profile.current_organization
                                        ? `${data.profile.current_title} at ${data.profile.current_organization}`
                                        : 'ITEK alumnus'}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {data.profile.available_for_projects && <Badge variant="secondary">Open to project work</Badge>}
                                {data.profile.available_for_mentoring && <Badge variant="secondary">Willing to mentor</Badge>}
                                {!data.profile.available_for_projects && !data.profile.available_for_mentoring && (
                                    <Badge variant="outline">Not currently available</Badge>
                                )}
                            </div>

                            <p className="text-xs leading-5 text-muted-foreground">
                                {data.profile.contact_consent
                                    ? `You agreed to be contacted about opportunities${
                                          data.profile.contact_consent_at
                                              ? ` on ${formatDate(data.profile.contact_consent_at)}`
                                              : ''
                                      }. You can withdraw that at any time.`
                                    : 'You have not consented to being contacted about opportunities, so ITEK will not approach you directly.'}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Your alumni profile has not been created yet. A programme administrator sets this up at the end
                            of an internship.
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Open opportunities</CardTitle>
                    <CardDescription>Roles currently published by ITEK.</CardDescription>
                </CardHeader>
                <CardContent>
                    {data.openOpportunities.length === 0 ? (
                        <EmptyState
                            icon={BriefcaseBusiness}
                            title="Nothing open right now"
                            description="When ITEK publishes a new opportunity it will appear here and on the public catalogue."
                        />
                    ) : (
                        <ul className="divide-y">
                            {data.openOpportunities.map((opportunity) => (
                                <li key={opportunity.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{opportunity.title}</p>
                                        <p className="truncate text-xs text-muted-foreground">{opportunity.summary}</p>
                                    </div>
                                    <Button asChild variant="outline" size="sm" className="shrink-0">
                                        <Link href={`/opportunities/${opportunity.slug}`}>View</Link>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
