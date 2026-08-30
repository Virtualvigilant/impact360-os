import { BookOpenCheck, ExternalLink } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { listLearningResources } from '@/lib/data/development';
import { humanise } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { Pagination } from '@/components/primitives/pagination';
import { EmptyState, Section } from '@/components/primitives/states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Learning hub · ITEK Internship OS' };

export default async function LearningPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    await requireRole([...ROLE_GROUPS.supervision, ...ROLE_GROUPS.participants], '/dashboard/learning');
    const params = await searchParams;
    const { data, error, schemaMissing } = await listLearningResources({ page: Number(params.page) || 1 });

    return (
        <div className="mx-auto max-w-6xl space-y-7">
            <PageHeader
                eyebrow="Development"
                title="Learning hub"
                description="Track-specific resources, internal guides and workshops — each tied to a competency, so learning connects to how you are actually assessed."
                icon={BookOpenCheck}
            />

            <Section error={error} schemaMissing={schemaMissing}>
                {data.rows.length === 0 ? (
                    <EmptyState
                        icon={BookOpenCheck}
                        title="No published resources"
                        description="Programme staff publish resources against a track and a competency. Nothing is published yet."
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {data.rows.map((resource) => (
                                <Card key={resource.id} className="flex flex-col">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-3">
                                            <CardTitle className="text-base leading-6">{resource.title}</CardTitle>
                                            {resource.is_required && <Badge>Required</Badge>}
                                        </div>
                                        <CardDescription>
                                            {humanise(resource.resource_type)}
                                            {resource.duration_minutes ? ` · ${resource.duration_minutes} min` : ' · self-paced'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-1 flex-col justify-between gap-4">
                                        {resource.content && (
                                            <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                                                {resource.content}
                                            </p>
                                        )}
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                {resource.track && <Badge variant="secondary">{resource.track.name}</Badge>}
                                                {resource.competency && (
                                                    <Badge variant="outline">{resource.competency.name}</Badge>
                                                )}
                                            </div>
                                            {resource.url && (
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
                                                >
                                                    Open resource
                                                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                                                </a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <Pagination page={data} label="resources" />
                    </>
                )}
            </Section>
        </div>
    );
}
