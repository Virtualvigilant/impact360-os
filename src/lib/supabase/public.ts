import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { supabaseEnv } from './env';

/**
 * A cookie-less client for genuinely public reads.
 *
 * `createServerSupabase` calls `cookies()`, which opts the whole route out of static
 * rendering — so the public opportunity catalogue was being server-rendered on every
 * request while carrying a `revalidate` export that did nothing.
 *
 * This client sends no session, so it sees exactly what an anonymous visitor sees and
 * the row-level security policies for published rows are the only thing gating it.
 * Never use it for anything a signed-in person should see more of.
 */
export const publicSupabase = createClient<Database>(
    supabaseEnv.NEXT_PUBLIC_SUPABASE_URL,
    supabaseEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
);
