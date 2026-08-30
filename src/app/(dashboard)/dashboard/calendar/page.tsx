import { CalendarDays } from 'lucide-react';
import { ROLE_GROUPS } from '@/lib/auth/roles';
import { requireRole } from '@/lib/auth/session';
import { listProgrammeEvents, type ProgrammeEvent } from '@/lib/data/programmes';
import { formatDateTime, formatRelativeTime, humanise } from '@/lib/utils/format';
import { PageHeader } from '@/components/primitives/page-header';
import { EmptyState, Section } from '@/components/primitives/states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Calendar · ITEK Internship OS' };

export default async function CalendarPage() {
    await requireRole(ROLE_GROUPS.everyone, '/dashboard/calendar');
    const { data, error, schemaMissing } = await listProgrammeEvents();


    return (
        <div className="mx-auto max-w-4xl space-y-7">
            <PageHeader
                eyebrow="Workspace"
                title="Programme calendar"
                description="Workshops, check-ins, milestones, reviews and deadlines — the operating rhythm of the programme in one place."
                icon={CalendarDays}
            />

            <Section error={error} schemaMissing={schemaMissing}>
                {data.upcoming.length === 0 && data.past.length === 0 ? (
                    <EmptyState
                        icon={CalendarDays}
                        title="Nothing scheduled"
                        description="Programme events appear here once staff create them against a programme."
                    />
                ) : (
                    <div className="space-y-8">
                        <EventList title="Coming up" events={data.upcoming} emptyText="Nothing scheduled ahead." />
                        {data.past.length > 0 && (
                            <EventList title="Recently" events={data.past.slice(0, 10)} emptyText="" dimmed />
                        )}
                    </div>
                )}
            </Section>
        </div>
    );
}

function EventList({
    title,
    events,
    emptyText,
    dimmed = false,
}: {
    title: string;
    events: ProgrammeEvent[];
    emptyText: string;
    dimmed?: boolean;
}) {
    return (
        <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
            {events.length === 0 ? (
                <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{emptyText}</p>
            ) : (
                <Card className={dimmed ? 'opacity-70' : undefined}>
                    <CardContent className="divide-y p-0">
                        {events.map((event) => (
                            <div key={event.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-medium">{event.title}</p>
                                        <Badge variant="secondary">{humanise(event.event_type)}</Badge>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {formatDateTime(event.starts_at)} ·{' '}
                                        {event.location_or_link || 'Location to be confirmed'}
                                        {event.programme?.name ? ` · ${event.programme.name}` : ''}
                                    </p>
                                    {event.description && (
                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                            {event.description}
                                        </p>
                                    )}
                                </div>
                                <span className="shrink-0 text-xs text-muted-foreground">
                                    {formatRelativeTime(event.starts_at)}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </section>
    );
}
