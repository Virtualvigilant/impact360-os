'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Account creation.
 *
 * Note what this no longer does: it does not send a `role` in the sign-up metadata, and
 * it does not write a `profiles` row itself. Both were paths by which the browser chose
 * its own role — `handle_new_user()` read that metadata, and the self-insert set the
 * column directly. Every account is now created as an intern by the database, and only
 * an administrator can change that.
 */
export function SignUpForm() {
    const router = useRouter();
    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    function update(field: keyof typeof form, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError(null);

        if (form.password !== form.confirmPassword) {
            setError('Those passwords do not match.');
            return;
        }
        if (form.password.length < 8) {
            setError('Use at least eight characters.');
            return;
        }

        setLoading(true);
        const { data, error: signUpError } = await getBrowserClient().auth.signUp({
            email: form.email,
            password: form.password,
            options: { data: { full_name: form.fullName } },
        });
        setLoading(false);

        if (signUpError) {
            setError(signUpError.message);
            return;
        }

        if (data.session) {
            router.replace('/dashboard');
            router.refresh();
        } else {
            router.replace('/sign-in?created=1');
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Field id="fullName" label="Full name" value={form.fullName} onChange={(v) => update('fullName', v)} autoComplete="name" />
            <Field id="email" label="Email" type="email" value={form.email} onChange={(v) => update('email', v)} autoComplete="email" />
            <Field
                id="password"
                label="Password"
                type="password"
                value={form.password}
                onChange={(v) => update('password', v)}
                autoComplete="new-password"
            />
            <Field
                id="confirmPassword"
                label="Confirm password"
                type="password"
                value={form.confirmPassword}
                onChange={(v) => update('confirmPassword', v)}
                autoComplete="new-password"
            />

            <p className="text-xs leading-5 text-muted-foreground">
                Creating an account does not create an internship placement. Apply to an open opportunity, and ITEK will
                connect an accepted application to your account.
            </p>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                Create account
            </Button>
        </form>
    );
}

function Field({
    id,
    label,
    type = 'text',
    value,
    onChange,
    autoComplete,
}: {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    autoComplete?: string;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                required
                autoComplete={autoComplete}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}
