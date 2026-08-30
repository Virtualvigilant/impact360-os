import Link from 'next/link';
import type { ReactNode } from 'react';
import { AlertTriangle, Database, Inbox, type LucideIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Shown when a query fails with "relation does not exist" — the migrations have not
 * been applied. Distinguished from a genuine error because the remedy is completely
 * different, and telling an administrator "something went wrong" when the answer is
 * "run the migrations" wastes their afternoon.
 */
export function SchemaNotice() {
    return (
        <Alert>
            <Database className="h-4 w-4" aria-hidden />
            <AlertTitle>The database schema is not deployed</AlertTitle>
            <AlertDescription>
                This module is ready, but the Supabase project has not had the Internship OS migrations applied. Run the files
                in <code className="font-mono text-xs">supabase/migrations</code> in filename order, then{' '}
                <code className="font-mono text-xs">supabase/seed.sql</code>. See{' '}
                <code className="font-mono text-xs">supabase/README.md</code>.
            </AlertDescription>
        </Alert>
    );
}

export function ErrorNotice({ message }: { message: string }) {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" aria-hidden />
            <AlertTitle>This view could not be loaded</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
}: {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
            <Icon className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden />
            <h2 className="mt-4 text-lg font-semibold">{title}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
            {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
        </div>
    );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3" aria-busy="true" aria-label="Loading">
            {Array.from({ length: rows }, (_, index) => (
                <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
        </div>
    );
}

export function CardsSkeleton({ cards = 4 }: { cards?: number }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Loading">
            {Array.from({ length: cards }, (_, index) => (
                <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
        </div>
    );
}

/**
 * Wraps a section so a data failure degrades that section only.
 * Every loader returns `{ error, schemaMissing }` rather than throwing, so a partial
 * outage renders a partial page instead of an error screen.
 */
export function Section({
    error,
    schemaMissing,
    children,
}: {
    error: string | null;
    schemaMissing: boolean;
    children: ReactNode;
}) {
    if (schemaMissing) return <SchemaNotice />;
    if (error) return <ErrorNotice message={error} />;
    return <>{children}</>;
}

export function BackLink({ href, label }: { href: string; label: string }) {
    return (
        <Link href={href} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            ← {label}
        </Link>
    );
}
