import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Stat {
    label: string;
    value: string | number;
    helper?: string;
    icon: LucideIcon;
    href?: string;
    tone?: 'default' | 'warning' | 'danger' | 'success';
}

const TONES: Record<NonNullable<Stat['tone']>, string> = {
    default: 'bg-primary/10 text-primary',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    danger: 'bg-destructive/10 text-destructive',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

export function StatCard({ label, value, helper, icon: Icon, href, tone = 'default' }: Stat) {
    const body = (
        <CardContent className="p-5">
            <div className={cn('grid h-9 w-9 place-items-center rounded-lg', TONES[tone])}>
                <Icon className="h-4 w-4" aria-hidden />
            </div>
            <p className="mt-4 text-2xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-sm font-medium">{label}</p>
            {helper ? <p className="mt-0.5 text-xs text-muted-foreground">{helper}</p> : null}
        </CardContent>
    );

    if (href) {
        return (
            <Card className="transition-colors hover:border-primary/40">
                <Link href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {body}
                </Link>
            </Card>
        );
    }
    return <Card>{body}</Card>;
}

export function StatGrid({ stats }: { stats: Stat[] }) {
    if (stats.length === 0) return null;
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </div>
    );
}
