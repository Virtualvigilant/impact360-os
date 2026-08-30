/**
 * Presentation helpers.
 *
 * ITEK is Kenyan, so dates and numbers render in `en-KE` / Africa/Nairobi rather than
 * the `en-US` the previous version hard-coded. Every function tolerates null and
 * malformed input, because these are called on database columns that are genuinely
 * nullable and rendering "Invalid Date" in a report is worse than rendering a dash.
 */

const LOCALE = 'en-KE';
const TIME_ZONE = 'Africa/Nairobi';
export const EM_DASH = '—';

function parse(value: string | Date | null | undefined): Date | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | Date | null | undefined, fallback = EM_DASH): string {
    const date = parse(value);
    if (!date) return fallback;
    return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: TIME_ZONE });
}

export function formatDateTime(value: string | Date | null | undefined, fallback = EM_DASH): string {
    const date = parse(value);
    if (!date) return fallback;
    return date.toLocaleString(LOCALE, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: TIME_ZONE,
    });
}

export function formatDateRange(
    start: string | Date | null | undefined,
    end: string | Date | null | undefined,
): string {
    const from = parse(start);
    const to = parse(end);
    if (!from && !to) return EM_DASH;
    if (!to) return `From ${formatDate(from)}`;
    if (!from) return `Until ${formatDate(to)}`;
    return `${formatDate(from)} – ${formatDate(to)}`;
}

/** For an ISO date-only column, so a `<input type="date">` round-trips unchanged. */
export function toDateInput(value: string | Date | null | undefined): string {
    const date = parse(value);
    return date ? date.toISOString().slice(0, 10) : '';
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000_000],
    ['month', 2_592_000_000],
    ['week', 604_800_000],
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
];

/**
 * "in 3 days" / "2 hours ago", via `Intl.RelativeTimeFormat`.
 *
 * The old implementation only counted backwards, so a task due tomorrow rendered as
 * "0 minutes ago". Deadlines are the main thing this is used for, and the sign matters.
 */
export function formatRelativeTime(value: string | Date | null | undefined, fallback = EM_DASH): string {
    const date = parse(value);
    if (!date) return fallback;

    const deltaMs = date.getTime() - Date.now();
    const absolute = Math.abs(deltaMs);
    if (absolute < 45_000) return 'just now';

    const formatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
    for (const [unit, ms] of RELATIVE_UNITS) {
        if (absolute >= ms) return formatter.format(Math.round(deltaMs / ms), unit);
    }
    return formatter.format(Math.round(deltaMs / 60_000), 'minute');
}

export function isOverdue(due: string | Date | null | undefined): boolean {
    const date = parse(due);
    return date != null && date.getTime() < Date.now();
}

export function getInitials(name: string | null | undefined): string {
    if (!name?.trim()) return '?';
    const parts = name.trim().split(/\s+/);
    const letters = parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[parts.length - 1][0]}`;
    return letters.toUpperCase();
}

/** `under_review` → `Under review`. Used for enum values throughout. */
export function humanise(value: string | null | undefined, fallback = EM_DASH): string {
    if (!value) return fallback;
    const spaced = value.replaceAll('_', ' ');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function formatPercent(value: number | null | undefined, fallback = EM_DASH): string {
    if (value == null || Number.isNaN(value)) return fallback;
    return `${Math.round(value)}%`;
}

export function formatScore(value: number | null | undefined, outOf = 5, fallback = 'Not scored'): string {
    if (value == null || Number.isNaN(value)) return fallback;
    return `${value.toFixed(1)} / ${outOf}`;
}

export function formatHours(value: number | null | undefined, fallback = EM_DASH): string {
    if (value == null || Number.isNaN(value)) return fallback;
    return `${Number(value.toFixed(1))} h`;
}

export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
    return `${count} ${count === 1 ? singular : plural}`;
}

export function percentOf(part: number, whole: number): number {
    if (whole <= 0) return 0;
    return Math.round((part / whole) * 100);
}
