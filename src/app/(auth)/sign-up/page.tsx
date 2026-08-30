import Link from 'next/link';
import { SignUpForm } from '@/components/auth/sign-up-form';

export const metadata = { title: 'Create an account · Impact 360 · Internship OS' };

export default function SignUpPage() {
    return (
        <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
                    Applicant account
                </span>
            </div>

            <h1 className="mt-5 text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-white">Create an account</h1>
            <p className="mt-2 text-[14px] leading-6 text-white/70">
                An account lets you track an application. It does not create a placement.
            </p>

            <div className="mt-8 border-t border-white/10 pt-6">
                <SignUpForm />
            </div>

            <div className="mt-8 space-y-2.5 border-t border-white/10 pt-6 text-[13px] text-white/60">
                <p>
                    Already have an account?{' '}
                    <Link href="/sign-in" className="font-medium text-white underline underline-offset-4 transition-colors hover:text-primary">
                        Sign in
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
