import { z } from 'zod';

/**
 * Fail loudly at boot rather than at the first query with a confusing
 * "Invalid API key". The previous code used `process.env.X!` in four places.
 */
const schema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
});

export const supabaseEnv = (() => {
    const parsed = schema.safeParse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
    if (!parsed.success) {
        throw new Error(
            `Supabase is not configured.\n${parsed.error.issues.map((i) => `  - ${i.message}`).join('\n')}\n` +
                'Copy .env.example to .env.local and fill both values.',
        );
    }
    return parsed.data;
})();
