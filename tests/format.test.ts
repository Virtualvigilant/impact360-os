import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
    EM_DASH,
    formatDate,
    formatDateRange,
    formatDateTime,
    formatHours,
    formatPercent,
    formatRelativeTime,
    formatScore,
    getInitials,
    humanise,
    isOverdue,
    percentOf,
    pluralise,
    toDateInput,
} from '@/lib/utils/format';

describe('null handling', () => {
    it('renders a dash rather than "Invalid Date" for every nullable column', () => {
        // Most columns these are called on are genuinely nullable; a report showing
        // "Invalid Date" is worse than one showing a dash.
        expect(formatDate(null)).toBe(EM_DASH);
        expect(formatDate(undefined)).toBe(EM_DASH);
        expect(formatDate('not a date')).toBe(EM_DASH);
        expect(formatDateTime(null)).toBe(EM_DASH);
        expect(formatPercent(null)).toBe(EM_DASH);
        expect(formatHours(null)).toBe(EM_DASH);
        expect(formatRelativeTime(null)).toBe(EM_DASH);
        expect(humanise(null)).toBe(EM_DASH);
    });

    it('takes a caller-supplied fallback', () => {
        expect(formatPercent(null, 'Not recorded')).toBe('Not recorded');
        expect(formatScore(null)).toBe('Not scored');
    });
});

describe('dates', () => {
    it('describes a range from either end', () => {
        expect(formatDateRange(null, null)).toBe(EM_DASH);
        expect(formatDateRange('2026-01-01', null)).toMatch(/^From /);
        expect(formatDateRange(null, '2026-01-01')).toMatch(/^Until /);
        expect(formatDateRange('2026-01-01', '2026-04-01')).toContain('–');
    });

    it('round-trips a date input value', () => {
        expect(toDateInput('2026-03-15')).toBe('2026-03-15');
        expect(toDateInput(null)).toBe('');
    });
});

describe('relative time', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
    });
    afterEach(() => vi.useRealTimers());

    it('counts forwards as well as backwards', () => {
        // The old implementation only counted backwards, so a task due tomorrow
        // rendered as "0 minutes ago" — on a deadline, the sign is the point.
        expect(formatRelativeTime('2026-06-16T12:00:00Z')).toBe('tomorrow');
        expect(formatRelativeTime('2026-06-14T12:00:00Z')).toBe('yesterday');
        expect(formatRelativeTime('2026-06-15T09:00:00Z')).toContain('hours ago');
        expect(formatRelativeTime('2026-06-15T15:00:00Z')).toContain('in 3 hours');
    });

    it('collapses the last minute to "just now"', () => {
        expect(formatRelativeTime('2026-06-15T12:00:10Z')).toBe('just now');
    });

    it('knows what is overdue', () => {
        expect(isOverdue('2026-06-14T12:00:00Z')).toBe(true);
        expect(isOverdue('2026-06-16T12:00:00Z')).toBe(false);
        expect(isOverdue(null)).toBe(false);
    });
});

describe('text', () => {
    it('builds initials from the first and last name', () => {
        expect(getInitials('Amina Wanjiru')).toBe('AW');
        expect(getInitials('Amina Njeri Wanjiru')).toBe('AW');
        expect(getInitials('Amina')).toBe('AM');
        expect(getInitials('')).toBe('?');
        expect(getInitials(null)).toBe('?');
    });

    it('turns an enum value into a sentence', () => {
        expect(humanise('under_review')).toBe('Under review');
        expect(humanise('changes_requested')).toBe('Changes requested');
    });

    it('pluralises', () => {
        expect(pluralise(1, 'check-in')).toBe('1 check-in');
        expect(pluralise(2, 'check-in')).toBe('2 check-ins');
        expect(pluralise(0, 'goal')).toBe('0 goals');
    });
});

describe('numbers', () => {
    it('does not divide by zero', () => {
        expect(percentOf(3, 0)).toBe(0);
        expect(percentOf(3, 4)).toBe(75);
    });

    it('formats a score out of five', () => {
        expect(formatScore(4.25)).toBe('4.3 / 5');
    });
});
