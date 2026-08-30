import { notFound } from 'next/navigation';
import { getPublishedOpportunity } from '@/lib/data/programmes';
import { formatDate, humanise } from '@/lib/utils/format';
import { PublicFooter, PublicHeader } from '@/components/records/chrome';
import { Action, Field, SectionHead, Tag } from '@/components/records/primitives';
import { Section } from '@/components/primitives/states';
import { ApplicationForm } from '@/components/applications/application-form';

export const revalidate = 300;

/** The version of the privacy notice this form collects consent against. */
const PRIVACY_NOTICE_VERSION = '2026.1';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { data } = await getPublishedOpportunity(slug);
    if (!data) return { title: 'Opportunity · ITEK Internship OS' };
    return {
        title: `${data.opportunity.title} · ITEK Internship OS`,
        description: data.opportunity.summary,
    };
}

export default async function OpportunityPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { data, error, schemaMissing } = await getPublishedOpportunity(slug);

    if (!error && !schemaMissing && !data) notFound();

    const opportunity = data?.opportunity;

    return (
        <div className="min-h-screen bg-background">
            <PublicHeader current="/opportunities" />

            <main>
                <Section error={error} schemaMissing={schemaMissing}>
                    {opportunity && data && (
                        <>
                            <section className="border-b border-border">
                                <div className="mx-auto max-w-6xl px-5 pb-14 pt-14 lg:px-8">
                                    <Action href="/opportunities" variant="quiet">
                                        ← All open positions
                                    </Action>

                                    <div className="mt-10 flex flex-wrap gap-2">
                                        <Tag tone="accent">{opportunity.track?.name ?? 'Technology'}</Tag>
                                        <Tag>{humanise(opportunity.work_arrangement)}</Tag>
                                        {data.window === 'closed' && <Tag tone="warn">Closed</Tag>}
                                        {data.window === 'not_yet_open' && <Tag tone="warn">Not yet open</Tag>}
                                    </div>

                                    <h1 className="mt-7 max-w-4xl text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
                                        {opportunity.title}
                                    </h1>

                                    <p className="mt-7 max-w-2xl text-[17px] leading-8 text-muted-foreground">
                                        {opportunity.summary}
                                    </p>

                                    <dl className="mt-14 grid max-w-4xl gap-x-12 sm:grid-cols-2 lg:grid-cols-4">
                                        <Field label="Programme" value={opportunity.programme?.name ?? 'ITEK Internship'} />
                                        <Field
                                            label="Places"
                                            value={`${opportunity.slots} ${opportunity.slots === 1 ? 'place' : 'places'}`}
                                        />
                                        <Field label="Location" value={opportunity.location || 'Kenya'} />
                                        <Field
                                            label="Applications close"
                                            value={opportunity.closes_at ? formatDate(opportunity.closes_at) : 'Rolling'}
                                        />
                                    </dl>
                                </div>
                            </section>

                            {(opportunity.responsibilities.length > 0 || opportunity.qualifications.length > 0) && (
                                <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
                                    <div className="grid gap-x-16 gap-y-14 md:grid-cols-2">
                                        {opportunity.responsibilities.length > 0 && (
                                            <div>
                                                <SectionHead label="What you will do" />
                                                <ul className="mt-8">
                                                    {opportunity.responsibilities.map((item, index) => (
                                                        <li key={item} className="flex gap-6 border-t border-border py-4">
                                                            <span className="ident shrink-0 text-muted-foreground">
                                                                {String(index + 1).padStart(2, '0')}
                                                            </span>
                                                            <span className="text-[15px] leading-7">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="border-t border-border" />
                                            </div>
                                        )}

                                        {opportunity.qualifications.length > 0 && (
                                            <div>
                                                <SectionHead label="What is required" />
                                                <ul className="mt-8">
                                                    {opportunity.qualifications.map((item, index) => (
                                                        <li key={item} className="flex gap-6 border-t border-border py-4">
                                                            <span className="ident shrink-0 text-muted-foreground">
                                                                {String(index + 1).padStart(2, '0')}
                                                            </span>
                                                            <span className="text-[15px] leading-7">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="border-t border-border" />
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            <section id="apply" className="border-t border-border bg-muted/30">
                                <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20">
                                    <SectionHead
                                        label="Application"
                                        title="Apply for this position."
                                        lede="A person reads this. Every decision on it is recorded against a named reviewer with a written reason, and you can ask for that record at any time."
                                    />

                                    <div className="mt-10">
                                        {data.window === 'closed' ? (
                                            <p className="border-y border-border py-12 text-center text-[15px] text-muted-foreground">
                                                Applications for this position closed on {formatDate(opportunity.closes_at)}.
                                            </p>
                                        ) : data.window === 'not_yet_open' ? (
                                            <p className="border-y border-border py-12 text-center text-[15px] text-muted-foreground">
                                                Applications open on {formatDate(opportunity.opens_at)}.
                                            </p>
                                        ) : (
                                            <ApplicationForm
                                                opportunityId={opportunity.id}
                                                privacyNoticeVersion={PRIVACY_NOTICE_VERSION}
                                            />
                                        )}
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </Section>
            </main>

            <PublicFooter />
        </div>
    );
}
