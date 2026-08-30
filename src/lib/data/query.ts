import 'server-only';

import type { PostgrestError } from '@supabase/supabase-js';
import { isSchemaMissing, readableError } from '@/lib/errors';

export {
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    emptyPage,
    pageBounds,
    sanitizeSearch,
    toPage,
    type Page,
    type PageRequest,
} from '@/lib/domain/paging';

/**
 * What a loader hands a page. `schemaMissing` is a first-class state because until the
 * migrations are applied every query fails the same way, and the interface should say
 * so once rather than render a dozen identical "something went wrong" cards.
 */
export interface Loaded<T> {
    data: T;
    error: string | null;
    schemaMissing: boolean;
}

export function loaded<T>(data: T): Loaded<T> {
    return { data, error: null, schemaMissing: false };
}

export function loadFailed<T>(fallback: T, error: PostgrestError | Error | null): Loaded<T> {
    const schemaMissing = isSchemaMissing(error as PostgrestError);
    if (!schemaMissing && error) {
        // Server-side only; never reaches the browser.
        console.error('[data]', error);
    }
    return {
        data: fallback,
        error: schemaMissing ? null : readableError(error, 'This view could not be loaded.'),
        schemaMissing,
    };
}

/** Run a loader, converting any thrown or returned Postgrest error into `Loaded`. */
export async function guard<T>(fallback: T, run: () => Promise<T>): Promise<Loaded<T>> {
    try {
        return loaded(await run());
    } catch (error) {
        return loadFailed(fallback, error as Error);
    }
}

/** Throw on a Postgrest error so `guard` can classify it in one place. */
export function unwrap<T>(result: { data: T | null; error: PostgrestError | null }): T {
    if (result.error) throw result.error;
    return result.data as T;
}
