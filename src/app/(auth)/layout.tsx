import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RecordsMark } from '@/components/records/chrome';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0B0D10] text-white">
            {/* Full-bleed background image */}
            <Image
                src="/auth-bg.jpg"
                alt=""
                fill
                className="object-cover object-center"
                priority
                quality={90}
            />

            {/* Cinematic dark gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D10]/85 via-[#0B0D10]/70 to-[#0B0D10]/95" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D10]/80 via-transparent to-[#0B0D10]/80" />

            {/* Header */}
            <header className="relative z-20 border-b border-white/10 bg-transparent backdrop-blur-sm">
                <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 lg:px-8">
                    <Link
                        href="/"
                        className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                        aria-label="Impact 360 Internship OS, home"
                    >
                        <RecordsMark tone="light" />
                    </Link>
                    <Link
                        href="/opportunities"
                        className="label-micro rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-white/80 backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/15 hover:text-white"
                    >
                        Open opportunities
                    </Link>
                </div>
            </header>

            {/* Main content with frosted glass card */}
            <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-12 lg:px-8">
                <div className="w-full max-w-md rounded-3xl border border-white/15 bg-black/50 p-8 shadow-2xl shadow-black/70 backdrop-blur-2xl sm:p-10">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 border-t border-white/10 bg-transparent">
                <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
                    <p className="text-[13px] text-white/50">
                        © {new Date().getFullYear()} Impact 360. The internship operating system of record.
                    </p>
                </div>
            </footer>
        </div>
    );
}

