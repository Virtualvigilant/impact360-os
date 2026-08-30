import { Suspense } from 'react';
import Link from 'next/link';
import { SignInForm } from '@/components/auth/sign-in-form';

export const metadata = { title: 'Sign in · Impact 360 · Internship OS' };

export default function SignInPage() {
    return (
        <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
                    Workspace
                </span>
            </div>

            <h1 className="mt-5 text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-white">Sign in</h1>
            <p className="mt-2 text-[14px] leading-6 text-white/70">
                For staff and interns with an active placement.
            </p>

            <div className="mt-8 border-t border-white/10 pt-6">
                {/* SignInForm reads search params (`next`, `reason`), which Next requires be suspended. */}
                <Suspense fallback={null}>
                    <SignInForm />
                </Suspense>
            </div>

            <div className="mt-8 space-y-2.5 border-t border-white/10 pt-6 text-[13px] text-white/60">
                <p>
                    No account yet?{' '}
                    <Link href="/sign-up" className="font-medium text-white underline underline-offset-4 transition-colors hover:text-primary">
                        Create one
                    </Link>
                </p>
                <p>
                    Looking for an internship?{' '}
                    <Link href="/opportunities" className="font-medium text-white underline underline-offset-4 transition-colors hover:text-primary">
                        See what is open
                    </Link>
                </p>
            </div>
        </div>
    );
}
