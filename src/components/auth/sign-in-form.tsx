'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Supabase auth errors are terse and sometimes leak intent; map the ones people hit. */
const MESSAGES: Record<string, string> = {
    'Invalid login credentials': 'That email and password do not match an account.',
    'Email not confirmed': 'Confirm your email address first — check your inbox for the link.',
};

export function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const reason = searchParams.get('reason');
    const created = searchParams.get('created');

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError(null);
        setLoading(true);

        const { error: signInError } = await getBrowserClient().auth.signInWithPassword({ email, password });

        if (signInError) {
            setError(MESSAGES[signInError.message] ?? signInError.message);
            setLoading(false);
            return;
        }

        // `next` comes from the proxy redirect. Only same-site paths are followed, so a
        // crafted `?next=https://elsewhere` cannot turn sign-in into an open redirect.
        const next = searchParams.get('next');
        const destination = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';

        router.replace(destination);
        router.refresh();
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {created && (
                <Alert>
                    <AlertDescription>Account created. Sign in to continue.</AlertDescription>
                </Alert>
            )}
            {reason === 'inactive' && (
                <Alert variant="destructive">
                    <AlertDescription>
                        That account is not active. Contact a programme administrator.
                    </AlertDescription>
                </Alert>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                Sign in
            </Button>
        </form>
    );
}
