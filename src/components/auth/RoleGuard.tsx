'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
    fallback?: string;
}

export function RoleGuard({ children, allowedRoles, fallback = '/dashboard' }: RoleGuardProps) {
    const { profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && profile && !allowedRoles.includes(profile.role)) {
            router.replace(fallback);
        }
    }, [loading, profile, allowedRoles, fallback, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile || !allowedRoles.includes(profile.role)) {
        return null;
    }

    return <>{children}</>;
}
