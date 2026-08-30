import Link from 'next/link';
import Image from 'next/image';
import { PublicFooter, PublicHeader } from '@/components/records/chrome';
import { Action, Field, NumberedRow, SectionHead, Tag } from '@/components/records/primitives';

export const metadata = {
    title: 'Impact 360 · Internship OS',
    description:
        "Impact 360's operating system of record for internships — recruitment, learning, work, supervision, evidence, evaluation and outcome.",
};

/** The four programme stages, in order. */
const STAGES: [string, string, string][] = [
    ['01', 'Orientation', 'Expectations set, programme documents completed, and a competency baseline recorded before any work is assigned.'],
    ['02', 'Skills development', 'Track-specific capability built through guided practice, against learning goals with an agreed success measure.'],
    ['03', 'Project work', 'Contribution to real projects, with evidence attached to each task and reviewed by a named supervisor.'],
    ['04', 'Final evaluation', 'Rubric assessment, intern feedback, completion verified against requirements, and a decision on what comes next.'],
];

/** What the system keeps a record of. Each maps to real tables. */
const RECORDS: [string, string, string][] = [
    ['R-01', 'Intern record', 'Identity, placement, track, named mentor and supervisor, current phase and derived risk level.'],
    ['R-02', 'Learning goals', 'Competency targets with a stated success measure, progress, and the mentor notes against each.'],
    ['R-03', 'Work and evidence', 'Tasks, acceptance criteria, submitted evidence, review decisions and the comments behind them.'],
    ['R-04', 'Weekly check-ins', 'Achievements, learning, blockers, support needed and wellbeing — with the mentor response recorded.'],
    ['R-05', 'Feedback', 'Multi-source and attributable, always naming a next action rather than only a verdict.'],
    ['R-06', 'Evaluation', 'Rubric scores where every criterion carries a written justification, not a number on its own.'],
    ['R-07', 'Operations', 'Attendance, leave, documents, assets, system access and stipends, each with a named decision-maker.'],
    ['R-08', 'Outcome', 'Completion requirements verified, certificate issued, and an honest recommendation for what follows.'],
];

const TRACKS: [string, string][] = [
    ['T-01', 'Software Development'],
    ['T-02', 'UI/UX & Product Design'],
    ['T-03', 'IT & Technical Operations'],
    ['T-04', 'Data & AI'],
    ['T-05', 'Cybersecurity'],
];

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <main>
                {/* ── Hero with transparent navbar and glassmorphism overlay ── */}
                <section className="relative min-h-[90vh] overflow-hidden">
                    <PublicHeader transparent />

                    {/* Background image */}
                    <Image
                        src="/hero-bg.jpg"
                        alt=""
                        fill
                        className="object-cover object-center"
                        priority
                        quality={90}
                    />

                    {/* Dark gradient overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D10]/95 via-[#0B0D10]/75 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10]/80 via-transparent to-[#0B0D10]/30" />

                    {/* Decorative blue accent shards */}
                    <div className="absolute -right-20 top-0 h-full w-1/2 bg-gradient-to-bl from-primary/20 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-6xl items-center px-5 lg:px-8 pt-24 pb-20">
                        <div className="w-full max-w-3xl py-24 lg:py-32">
                            {/* Glassmorphism badge */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 backdrop-blur-md">
                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                                    ITEK Solutions · Internship Programme
                                </span>
                            </div>

                            <h1 className="mt-8 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.03em] text-white">
                                Every stage of an internship,
                                <br className="hidden sm:block" />
                                <span className="bg-gradient-to-r from-white via-blue-200 to-primary bg-clip-text text-transparent">
                                    on the record.
                                </span>
                            </h1>

                            <p className="mt-8 max-w-2xl text-[17px] leading-8 text-white/70">
                                Who this person is, why they were selected, what they should learn, who owns their supervision,
                                what they actually built, what evidence exists, and what they are ready for next. Written down,
                                attributable, and available to the person it describes.
                            </p>

                            {/* CTA buttons */}
                            <div className="mt-10 flex flex-wrap items-center gap-4">
                                <Link
                                    href="/opportunities"
                                    className="group inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D10]"
                                >
                                    View open opportunities
                                    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/sign-in"
                                    className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D10]"
                                >
                                    Open the workspace
                                </Link>
                            </div>

                            {/* Glassmorphism stats bar */}
                            <div className="mt-16 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl sm:grid-cols-4">
                                {[
                                    ['Tracks', 'Five specialist areas'],
                                    ['Commitment', '40 hrs / week'],
                                    ['Supervision', 'Named mentor'],
                                    ['On completion', 'Verified certificate'],
                                ].map(([label, value]) => (
                                    <div key={label} className="border-r border-white/5 px-5 py-4 last:border-r-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">{label}</p>
                                        <p className="mt-1.5 text-[14px] font-medium text-white/90">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stages */}
                <section id="programme" className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
                    <SectionHead
                        label="The programme"
                        title="Four stages, each producing something you keep."
                        lede="An internship is only worth doing if there is evidence of it afterwards. Each stage closes with a record the intern owns and can show to someone else."
                        aside="Stages 01–04"
                    />

                    <div className="mt-12">
                        {STAGES.map(([index, title, body]) => (
                            <NumberedRow key={index} index={index} title={title} body={body} />
                        ))}
                        <div className="border-t border-border" />
                    </div>
                </section>

                {/* What is recorded */}
                <section className="border-y border-border bg-muted/30">
                    <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
                        <SectionHead
                            label="The register"
                            title="What the system holds."
                            lede="Not a project tracker with an internship theme. These are the records a programme needs in order to answer hard questions about it a year later."
                            aside="8 record types"
                        />

                        <div className="mt-12 grid gap-6 md:grid-cols-2">
                            {RECORDS.map(([ident, title, body], i) => {
                                const row = Math.floor(i / 2);
                                const col = i % 2;
                                const isBlue = (row + col) % 2 === 0;

                                return (
                                    <div
                                        key={ident}
                                        className={`rounded-2xl p-6 transition-all ${
                                            isBlue
                                                ? 'bg-[#306CEC] text-white shadow-lg shadow-[#306CEC]/20 border border-[#306CEC]'
                                                : 'bg-card text-foreground border border-border shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-baseline gap-4">
                                            <span className={`ident ${isBlue ? 'text-white/80' : 'text-primary'}`}>{ident}</span>
                                            <h3 className={`text-[16px] font-semibold tracking-[-0.01em] ${isBlue ? 'text-white' : 'text-foreground'}`}>
                                                {title}
                                            </h3>
                                        </div>
                                        <p className={`mt-2.5 pl-[3.6rem] text-[14px] leading-6 ${isBlue ? 'text-white/85' : 'text-muted-foreground'}`}>
                                            {body}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Tracks */}
                <section id="tracks" className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
                    <SectionHead
                        label="Tracks"
                        title="Five tracks. One standard of professional growth."
                        lede="The work differs. What is expected of you — evidence, reflection, communication, professionalism — does not."
                    />

                    <div className="mt-12 max-w-3xl">
                        {TRACKS.map(([ident, name]) => (
                            <div key={ident} className="flex items-baseline gap-6 border-t border-border py-5">
                                <span className="ident text-primary">{ident}</span>
                                <span className="text-[17px] font-medium tracking-[-0.01em]">{name}</span>
                            </div>
                        ))}
                        <div className="flex items-baseline gap-6 border-y border-border py-5">
                            <span className="ident text-muted-foreground">T-06</span>
                            <span className="text-[17px] text-muted-foreground">Other technology areas, as ITEK needs</span>
                        </div>
                    </div>
                </section>

                {/* Closing */}
                <section className="border-t border-foreground bg-foreground text-background">
                    <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
                        <p className="label-micro text-background/55">Applications</p>
                        <h2 className="mt-6 max-w-3xl text-[clamp(1.875rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                            A person reads every application, and writes down why.
                        </h2>
                        <p className="mt-6 max-w-2xl text-[16px] leading-8 text-background/70">
                            Assistive scoring informs that decision; it never makes it. If your application does not go
                            forward, the reason exists in writing and you can ask for it.
                        </p>
                        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                            <Link
                                href="/opportunities"
                                className="label-micro inline-flex items-center justify-center bg-background px-5 py-3.5 text-foreground transition-opacity hover:opacity-88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
                            >
                                See what is open
                            </Link>
                            <span className="label-micro text-background/55">
                                Unsuccessful applications are kept 12 months, then deleted
                            </span>
                        </div>

                        <div className="mt-14 flex flex-wrap gap-2">
                            <Tag tone="quiet">Named supervision</Tag>
                            <Tag tone="quiet">Written decisions</Tag>
                            <Tag tone="quiet">Evidence you keep</Tag>
                            <Tag tone="quiet">Verified completion</Tag>
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}
