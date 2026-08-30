import 'server-only';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

/**
 * Route-handler guard.
 *
 * `/api/learning-feed` and `/api/youtube-preview` were open to the internet and called
 * third-party APIs using ITEK's own `YOUTUBE_API_KEY` — anyone could burn the quota, and
 * the routes were a free CORS-free proxy for anybody who found them.
 */
export async function requireApiSession() {
    const session = await getSession();
    if (!session) {
        return { session: null, response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
    }
    return { session, response: null };
}

/** Very small fixed-window limiter, keyed per user, held in this instance's memory. */
const buckets = new Map<string, { count: number; resetAt: number }>();

function allow(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    if (bucket.count >= limit) return false;

    bucket.count += 1;
    return true;
}

/**
 * Per-instance and best-effort: a serverless deployment runs several instances, so this
 * bounds abuse rather than eliminating it. It is here to stop one signed-in person
 * exhausting a third-party quota, not as a security control. Move it to a shared store
 * if that stops being enough.
 */
export function rateLimited(userId: string, route: string, limit = 30, windowMs = 60_000) {
    if (allow(`${route}:${userId}`, limit, windowMs)) return null;
    return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 });
}
