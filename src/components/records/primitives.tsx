import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Records & Rules — the public surface's vocabulary.
 *
 * The organising idea: this product's argument is that every consequential stage
 * produces an attributable record, so the interface is built like a register rather
 * than a brochure. That means hairline rules instead of cards and shadows, monospace
 * for anything that is an identifier or a figure, and numbers that align down a column.
 *
 * Everything here draws on the existing token set — no parallel palette — so the same
 * components will work unchanged when the dashboard adopts this language.
 */

/** A block's name: monospace micro-label, an accent tick, and a hairline across. */
export function SectionHead({
    label,
    title,
    lede,
    aside,
    className,
}: {
    label: string;
    title?: string;
    lede?: string;
    /** Right-aligned counter or note, e.g. "48 active". */
    aside?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('border-t border-foreground pt-4', className)}>
            <div className="flex items-baseline justify-between gap-6">
                <p className="label-micro text-primary">{label}</p>
                {aside ? <p className="label-micro text-muted-foreground">{aside}</p> : null}
            </div>

            {title ? (
                <h2 className="mt-6 max-w-3xl text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.02em]">
                    {title}
                </h2>
            ) : null}

            {lede ? <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">{lede}</p> : null}
        </div>
    );
}

/**
 * One row of the register.
 *
 * `ident` is the record's real identifier and is always shown. A register where you
 * cannot quote the row back to someone is not a register.
 */
export function RecordRow({
    ident,
    title,
    meta,
    figures,
    status,
    href,
    children,
}: {
    ident: string;
    title: string;
    meta?: ReactNode;
    figures?: ReactNode;
    status?: ReactNode;
    href?: string;
    children?: ReactNode;
}) {
    const inner = (
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 py-6 sm:grid-cols-[7rem_1fr_auto]">
            <p className="ident pt-0.5 text-muted-foreground">{ident}</p>

            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-[17px] font-medium leading-6 tracking-[-0.01em]">{title}</h3>
                    {status}
                </div>
                {meta ? <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">{meta}</p> : null}
                {children}
            </div>

            {figures ? <div className="flex items-start gap-7 sm:justify-end">{figures}</div> : null}
        </div>
    );

    if (!href) return <div className="border-t border-border">{inner}</div>;

    return (
        <div className="border-t border-border">
            <Link
                href={href}
                className="block transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
                {inner}
            </Link>
        </div>
    );
}

/** A single figure: tabular numeral over a monospace label. */
export function Figure({
    value,
    label,
    tone = 'default',
}: {
    value: ReactNode;
    label: string;
    tone?: 'default' | 'warn' | 'good';
}) {
    return (
        <div className="min-w-[3.5rem]">
            <p
                className={cn(
                    'text-[17px] font-medium tabular-nums leading-6',
                    tone === 'warn' && 'text-destructive',
                    tone === 'good' && 'text-emerald-600',
                )}
            >
                {value}
            </p>
            <p className="label-micro mt-1 text-muted-foreground">{label}</p>
        </div>
    );
}

/**
 * A squared-off tag. Deliberately not the rounded pill used elsewhere: a pill reads as
 * a chip you can dismiss, and these are statements of fact about the record.
 */
export function Tag({
    children,
    tone = 'default',
}: {
    children: ReactNode;
    tone?: 'default' | 'accent' | 'warn' | 'quiet';
}) {
    return (
        <span
            className={cn(
                'label-micro inline-flex items-center border px-2 py-1 leading-none',
                tone === 'default' && 'border-border text-muted-foreground',
                tone === 'accent' && 'border-primary/40 bg-primary/5 text-primary',
                tone === 'warn' && 'border-destructive/40 bg-destructive/5 text-destructive',
                tone === 'quiet' && 'border-transparent bg-muted text-muted-foreground',
            )}
        >
            {children}
        </span>
    );
}

/** A key/value pair, as it would appear on a record sheet. */
export function Field({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="border-t border-border py-4">
            <dt className="label-micro text-muted-foreground">{label}</dt>
            <dd className="mt-2 text-[15px] leading-6">{value}</dd>
        </div>
    );
}

/** The primary action. Square, solid, no shadow. */
export function Action({
    href,
    children,
    variant = 'solid',
    className,
}: {
    href: string;
    children: ReactNode;
    variant?: 'solid' | 'outline' | 'quiet';
    className?: string;
}) {
    return (
        <Link
            href={href}
            className={cn(
                'label-micro inline-flex items-center justify-center gap-2 px-5 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                variant === 'solid' && 'bg-foreground text-background hover:bg-foreground/88',
                variant === 'outline' && 'border border-foreground text-foreground hover:bg-foreground hover:text-background',
                variant === 'quiet' && 'border-b border-border px-0 py-1 text-muted-foreground hover:border-foreground hover:text-foreground',
                className,
            )}
        >
            {children}
        </Link>
    );
}

/** A numbered entry, for ordered sequences like the programme stages. */
export function NumberedRow({
    index,
    title,
    body,
    aside,
}: {
    index: string;
    title: string;
    body: string;
    aside?: ReactNode;
}) {
    return (
        <div className="grid grid-cols-[3rem_1fr] gap-x-6 border-t border-border py-7 sm:grid-cols-[4rem_1fr_auto] sm:gap-x-10">
            <p className="ident text-primary">{index}</p>
            <div className="min-w-0">
                <h3 className="text-[17px] font-medium leading-6 tracking-[-0.01em]">{title}</h3>
                <p className="mt-2 max-w-xl text-[14px] leading-6 text-muted-foreground">{body}</p>
            </div>
            {aside ? <div className="col-start-2 sm:col-start-3 sm:text-right">{aside}</div> : null}
        </div>
    );
}
