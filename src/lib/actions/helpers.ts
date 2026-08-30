import 'server-only';

import type { z } from 'zod';
import { getSession, type Session } from '@/lib/auth/session';
import { can, type Permission } from '@/lib/auth/roles';
import { fail, ok, readableError, type ActionResult } from '@/lib/errors';

/**
 * The spine every server action shares: authenticate, authorise, validate, then run.
 *
 * Writes used to go straight from the browser to Supabase with no validation, relying
 * entirely on RLS to reject bad ones. RLS answers "may this person write here?" — it
 * does not answer "is this a sensible record?", and it produces errors written for a
 * database administrator rather than for the person filling in the form.
 */
export async function action<Schema extends z.ZodType, Result>(
    options: {
        permission?: Permission;
        schema: Schema;
        input: unknown;
    },
    run: (input: z.infer<Schema>, session: Session) => Promise<Result>,
): Promise<ActionResult<Result>> {
    const session = await getSession();
    if (!session) return fail('Your session has expired. Sign in again.');

    if (options.permission && !can(session.role, options.permission)) {
        return fail('You do not have permission to do that.');
    }

    const parsed = options.schema.safeParse(options.input);
    if (!parsed.success) {
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of parsed.error.issues) {
            const key = issue.path.join('.') || '_form';
            (fieldErrors[key] ??= []).push(issue.message);
        }
        return fail('Please correct the highlighted fields.', fieldErrors);
    }

    try {
        return ok(await run(parsed.data, session));
    } catch (error) {
        return fail(readableError(error as Error));
    }
}

/**
 * An action whose only input is a record id it already trusts the caller to name —
 * approving a leave request, submitting a drafted evaluation. Same authentication and
 * authorisation path, no schema.
 */
export async function simpleAction<Result>(
    permission: Permission | undefined,
    run: (session: Session) => Promise<Result>,
): Promise<ActionResult<Result>> {
    const session = await getSession();
    if (!session) return fail('Your session has expired. Sign in again.');
    if (permission && !can(session.role, permission)) {
        return fail('You do not have permission to do that.');
    }
    try {
        return ok(await run(session));
    } catch (error) {
        return fail(readableError(error as Error));
    }
}

/** Turn a `<form>` submission into a plain object zod can parse. */
export function formToObject(formData: FormData): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) continue;
        // A checkbox absent from the payload means false; present means true.
        if (key in result) {
            const existing = result[key];
            result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
        } else {
            result[key] = value;
        }
    }
    return result;
}
