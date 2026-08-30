import type { PostgrestError } from '@supabase/supabase-js';

/** Postgres error codes that mean something specific to a user. */
const CODE_MESSAGES: Record<string, string> = {
    '23505': 'That record already exists.',
    '23503': 'A record this depends on is missing.',
    '23514': 'Those values are not allowed for this record.',
    '42501': 'You do not have permission to do that.',
    '42P01': 'The database schema has not been deployed yet.',
    '42883': 'The database schema has not been deployed yet.',
    PGRST116: 'That record was not found.',
    PGRST301: 'Your session has expired. Sign in again.',
};

/** True when the failure is "the migrations have not been run", not "bad request". */
export function isSchemaMissing(error: PostgrestError | null | undefined): boolean {
    if (!error) return false;
    return error.code === '42P01' || error.code === '42883' || /does not exist/i.test(error.message);
}

/**
 * Turn a Postgrest error into something worth showing a person.
 *
 * Raw `error.message` was surfaced straight into toasts before, leaking column names
 * and policy names into the interface.
 */
export function readableError(error: PostgrestError | Error | null | undefined, fallback = 'Something went wrong.'): string {
    if (!error) return fallback;
    if ('code' in error && typeof error.code === 'string' && CODE_MESSAGES[error.code]) {
        return CODE_MESSAGES[error.code];
    }
    if (error.message && !/^[A-Z_]+$/.test(error.message)) return error.message;
    return fallback;
}

/** The result shape every server action returns. */
export type ActionResult<T = void> =
    | { ok: true; data: T }
    | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export function ok<T>(data: T): ActionResult<T> {
    return { ok: true, data };
}

export function fail(error: string, fieldErrors?: Record<string, string[]>): ActionResult<never> {
    return { ok: false, error, fieldErrors };
}
