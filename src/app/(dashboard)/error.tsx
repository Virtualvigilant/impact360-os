'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Scoped to the dashboard, so a failure inside one module keeps the shell — navigation,
 * the person's identity, a way out — instead of replacing the whole application with an
 * error screen.
 */
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error('[dashboard]', error);
    }, [error]);

    return (
        <div className="mx-auto max-w-2xl py-12">
            <Card>
                <CardContent className="p-8 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden />
                    </div>
                    <h1 className="mt-5 text-lg font-semibold">This module could not load</h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        The rest of the system is unaffected. If this keeps happening, quote the reference below.
                    </p>
                    {error.digest && (
                        <p className="mt-4 inline-block rounded-lg bg-muted px-3 py-2 font-mono text-xs">
                            Reference: {error.digest}
                        </p>
                    )}
                    <div className="mt-6 flex justify-center gap-2">
                        <Button onClick={reset}>
                            <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
                            Try again
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/dashboard">Command center</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
