import { listPublishedOpportunities } from '@/lib/data/programmes';
import { formatDate, humanise } from '@/lib/utils/format';
import { PublicFooter, PublicHeader } from '@/components/records/chrome';
import { Figure, RecordRow, SectionHead, Tag } from '@/components/records/primitives';
import { Section } from '@/components/primitives/states';

export const metadata = {
    title: 'Open opportunities · ITEK Internship OS',
    description:
        'Open internship positions at ITEK Solutions — structured programmes built around real work, named supervision and evidence.',
};

// Public and slow-changing, and it reads through the cookie-less client, so it can be
// served from cache rather than rendered per request.
export const revalidate = 300;

export default async function PublicOpportunitiesPage() {
    const { data, error, schemaMissing } = await listPublishedOpportunities();

    return (
        <div className="min-h-screen bg-background">
            <PublicHeader current="/opportunities" />

            <main>
                <section className="border-b border-border">
                    <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 lg:px-8 lg:pt-20">
                        <p className="label-micro text-primary">Open positions</p>
                        <h1 className="mt-8 max-w-3xl text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
                            Internships currently open at ITEK.
                        </h1>
                        <p className="mt-7 max-w-2xl text-[16px] leading-8 text-muted-foreground">
                            Each position states the work, what is genuinely required, and when applications close. A person
                            reviews every application and records the reason for their decision.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
                    <Section error={error} schemaMissing={schemaMissing}>
                        <SectionHead
                            label="Register of open positions"
                            aside={
                                data.length === 0
                                    ? 'None open'
                                    : `${data.length} open · ${data.reduce((sum, o) => sum + o.slots, 0)} places`
                            }
                        />

                        {data.length === 0 ? (
                            <div className="border-y border-border py-20 text-center">
                                <p className="text-[17px] font-medium">Nothing is open right now.</p>
                                <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-muted-foreground">
                                    ITEK publishes positions ahead of each intake. When one opens it will be listed here and
                                    the application form opens with it.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-2">
                                {data.map((opportunity, index) => (
                                    <RecordRow
                                        key={opportunity.id}
                                        ident={`OPP-${String(index + 1).padStart(3, '0')}`}
                                        title={opportunity.title}
                                        href={`/opportunities/${opportunity.slug}`}
                                        status={
                                            <>
                                                <Tag tone="accent">{opportunity.track?.name ?? 'Technology'}</Tag>
                                                <Tag>{humanise(opportunity.work_arrangement)}</Tag>
                                            </>
                                        }
                                        meta={
                                            <>
                                                {opportunity.location || 'Kenya'}
                                                {opportunity.programme?.cohort_label
                                                    ? ` · ${opportunity.programme.cohort_label}`
                                                    : ''}
                                            </>
                                        }
                                        figures={
                                            <>
                                                <Figure value={opportunity.slots} label="Places" />
                                                <Figure
                                                    value={
                                                        opportunity.closes_at ? formatDate(opportunity.closes_at) : 'Rolling'
                                                    }
                                                    label="Closes"
                                                />
                                            </>
                                        }
                                    >
                                        <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted-foreground">
                                            {opportunity.summary}
                                        </p>
                                    </RecordRow>
                                ))}
                                <div className="border-t border-border" />
                            </div>
                        )}
                    </Section>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}
