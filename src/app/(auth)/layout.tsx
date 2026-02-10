import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
            <div className="w-full max-w-md p-8">
                {children}
            </div>
        </div>
    );
}