/**
 * Paging and search-term handling.
 *
 * Pure: the `Pagination` component renders these shapes in the browser and the data
 * layer produces them on the server.
 */

export interface PageRequest {
    page?: number;
    pageSize?: number;
}

export interface Page<T> {
    rows: T[];
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
}

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

/**
 * Clamp caller-supplied paging.
 *
 * A crafted `?pageSize=100000` must not be able to pull the whole table, and anything
 * nonsensical — zero, negative, NaN — falls back to the default rather than to 1, which
 * would produce a one-row-per-page listing nobody asked for.
 */
export function pageBounds({ page, pageSize }: PageRequest = {}) {
    const requestedSize = Math.trunc(Number(pageSize));
    const safeSize =
        Number.isFinite(requestedSize) && requestedSize > 0
            ? Math.min(requestedSize, MAX_PAGE_SIZE)
            : DEFAULT_PAGE_SIZE;

    const requestedPage = Math.trunc(Number(page));
    const safePage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

    return { page: safePage, pageSize: safeSize, from: (safePage - 1) * safeSize, to: safePage * safeSize - 1 };
}

export function toPage<T>(rows: T[] | null, count: number | null, bounds: { page: number; pageSize: number }): Page<T> {
    const total = count ?? rows?.length ?? 0;
    return {
        rows: rows ?? [],
        total,
        page: bounds.page,
        pageSize: bounds.pageSize,
        pageCount: Math.max(Math.ceil(total / bounds.pageSize), 1),
    };
}

export function emptyPage<T>(bounds: { page: number; pageSize: number }): Page<T> {
    return { rows: [], total: 0, page: bounds.page, pageSize: bounds.pageSize, pageCount: 1 };
}

/**
 * Escape a user-supplied search term for PostgREST's `or(...)` filter grammar, where a
 * bare comma or parenthesis changes the meaning of the whole expression — a search box
 * should not be able to rewrite the query it feeds.
 */
export function sanitizeSearch(term: string): string {
    return term.replace(/[,()\\]/g, ' ').replace(/%/g, '\\%').trim().slice(0, 120);
}
