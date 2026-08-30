import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { canAccessRoute } from '@/lib/auth/navigation';
import { isAppRole } from '@/lib/auth/roles';

/**
 * Edge request gate (Next 16 names this `proxy`, formerly `middleware`).
 *
 * Two changes from the previous version:
 *
 *   1. `getUser()` instead of `getSession()`. `getSession()` decodes the cookie without
 *      contacting the auth server, so a forged cookie satisfied it.
 *   2. Role-aware routing. Before, the sidebar's role filter was the only thing keeping
 *      an intern out of `/dashboard/admin`; typing the URL worked. Access now derives
 *      from the same map the sidebar reads.
 *
 * This is a usability and defence-in-depth layer. Row-level security remains the real
 * boundary: even a bypass here returns no rows the person may not read.
 */
export async function proxy(request: NextRequest) {
    let response = NextResponse.next({ request: { headers: request.headers } });

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll(cookiesToSet) {
                    for (const { name, value } of cookiesToSet) {
                        request.cookies.set(name, value);
                    }
                    response = NextResponse.next({ request: { headers: request.headers } });
                    for (const { name, value, options } of cookiesToSet) {
                        response.cookies.set(name, value, options);
                    }
                },
            },
        },
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname, search } = request.nextUrl;
    const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

    if (isAuthPage) {
        if (user) return NextResponse.redirect(new URL('/dashboard', request.url));
        return response;
    }

    if (!pathname.startsWith('/dashboard')) return response;

    if (!user) {
        const signIn = new URL('/sign-in', request.url);
        signIn.searchParams.set('next', `${pathname}${search}`);
        return NextResponse.redirect(signIn);
    }

    // One extra read per dashboard request, which the profile query needs anyway.
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.is_active) {
        // Deactivated or not yet provisioned: end the session rather than loop.
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/sign-in?reason=inactive', request.url));
    }

    const role = isAppRole(profile.role) ? profile.role : null;

    if (!canAccessRoute(role, pathname)) {
        const home = new URL('/dashboard', request.url);
        home.searchParams.set('denied', '1');
        return NextResponse.redirect(home);
    }

    return response;
}

export const config = {
    matcher: ['/dashboard/:path*', '/sign-in', '/sign-up'],
};
