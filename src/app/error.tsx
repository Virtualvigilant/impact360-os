'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * The last line of defence.
 *
 * Deliberately shows `error.digest` and not `error.message`: in production Next replaces
 * the message with a digest anyway, and displaying whatever string reached the client
 * risks putting an internal detail on screen. The digest is what correlates with the
 * server log.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error('[unhandled]', error);
    }, [error]);

    return (
        <div className="grid min-h-screen place-items-center p-6">
            <div className="max-w-md text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden />
                </div>
                <h1 className="mt-5 text-xl font-semibold">Something went wrong</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    This page could not be rendered. Trying again often works; if it does not, send the reference below to
                    whoever supports this system.
                </p>
                {error.digest && (
                    <p className="mt-4 rounded-lg bg-muted px-3 py-2 font-mono text-xs">Reference: {error.digest}</p>
                )}
                <Button onClick={reset} className="mt-6">
                    <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
                    Try again
                </Button>
            </div>
        </div>
    );
}
