import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Shared chrome for the public surface.
 *
 * The mark is set as a two-part lockup — organisation, then system — because that is
 * how the product refers to itself in the records it produces.
 */
export function RecordsMark({ className, tone = 'default' }: { className?: string; tone?: 'default' | 'light' }) {
    return (
        <span className={cn('flex items-center gap-2.5', className)}>
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary shadow-sm">
                <Image
                    src="/logo.png"
                    alt="Impact 360 Logo"
                    width={32}
                    height={32}
                    className="h-full w-full object-contain p-0.5"
                    priority
                />
            </div>
            <span className="flex items-baseline gap-2">
                <span className={cn('text-[15px] font-semibold tracking-[0.12em]', tone === 'light' ? 'text-white' : 'text-foreground')}>
                    IMPACT 360
                </span>
                <span className={cn('h-3 w-px', tone === 'light' ? 'bg-white/25' : 'bg-border')} aria-hidden />
                <span className={cn('label-micro', tone === 'light' ? 'text-white/70' : 'text-muted-foreground')}>
                    Internship OS
                </span>
            </span>
        </span>
    );
}

const NAV = [
    { label: 'Opportunities', href: '/opportunities' },
    { label: 'Programme', href: '/#programme' },
    { label: 'Tracks', href: '/#tracks' },
];

export function PublicHeader({ current, transparent = false }: { current?: string; transparent?: boolean }) {
    return (
        <header
            className={cn(
                'z-50 transition-all',
                transparent
                    ? 'absolute top-0 inset-x-0 border-b border-white/10 bg-transparent'
                    : 'sticky top-0 border-b border-white/15 bg-background/65 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_4px_24px_rgba(0,0,0,0.04)]'
            )}
        >
            <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-5 lg:px-8">
                <Link
                    href="/"
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 rounded-lg"
                    aria-label="Impact 360 Internship OS, home"
                >
                    <RecordsMark tone={transparent ? 'light' : 'default'} />
                </Link>

                <nav aria-label="Primary" className="flex items-center gap-6 sm:gap-8">
                    {NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={current === item.href ? 'page' : undefined}
                            className={cn(
                                'label-micro hidden transition-all sm:block py-1.5 px-3 rounded-full',
                                transparent
                                    ? current === item.href
                                        ? 'text-white font-semibold bg-white/15'
                                        : 'text-white/75 hover:text-white hover:bg-white/10'
                                    : current === item.href
                                        ? 'text-foreground font-semibold bg-black/5 dark:bg-white/5'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5',
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <Link
                        href="/sign-in"
                        className={cn(
                            'label-micro inline-flex items-center justify-center rounded-full px-5 py-2 backdrop-blur-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                            transparent
                                ? 'border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 hover:shadow-lg hover:shadow-white/5'
                                : 'border border-primary/25 bg-primary/10 text-primary hover:bg-primary hover:text-white hover:shadow-md hover:shadow-primary/25'
                        )}
                    >
                        Sign in
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export function PublicFooter() {
    return (
        <footer className="border-t border-foreground">
            <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-baseline sm:justify-between">
                    <Link
                        href="/"
                        className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                        aria-label="Impact 360 Internship OS, home"
                    >
                        <RecordsMark />
                    </Link>
                    <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2">
                        {NAV.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="label-micro text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <p className="mt-8 text-[13px] leading-6 text-muted-foreground">
                    © {new Date().getFullYear()} ITEK Solutions. The internship operating system of record.
                </p>
            </div>
        </footer>
    );
}
