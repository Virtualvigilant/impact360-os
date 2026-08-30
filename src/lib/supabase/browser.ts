'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { supabaseEnv } from './env';

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * One browser client for the tab.
 *
 * The previous `supabaseClient()` constructed a fresh client on every call — inside
 * render bodies and effect callbacks — so a page could hold a dozen of them, each with
 * its own auth listener and token refresh timer.
 */
export function getBrowserClient() {
    client ??= createBrowserClient<Database>(
        supabaseEnv.NEXT_PUBLIC_SUPABASE_URL,
        supabaseEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    return client;
}
