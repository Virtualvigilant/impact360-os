/**
 * Derived programme metrics.
 *
 * Pure functions so a headline number can be unit-tested and explained, rather than
 * computed inline in a component where nobody can check it.
 */

export interface AttendanceLike {
    status: string;
}

/**
 * Attendance over the supplied window.
 *
 * Excused absence is removed from the denominator rather than counted against the
 * intern: approved absence is not a failure to attend, and letting it lower the rate
 * turns the number into a reason not to ask for leave.
 *
 * Returns null when nothing countable was recorded — a rate of 0% and "no data" mean
 * very different things to whoever reads it.
 */
export function attendanceRate(records: readonly AttendanceLike[]): number | null {
    if (records.length === 0) return null;
    const counted = records.filter((record) => record.status !== 'excused');
    if (counted.length === 0) return null;
    const attended = counted.filter(
        (record) => record.status === 'present' || record.status === 'remote' || record.status === 'late',
    );
    return Math.round((attended.length / counted.length) * 100);
}

export interface RequirementLike {
    placement_id: string;
    is_complete: boolean;
}

/** Completion progress for one placement: satisfied requirements over total. */
export function completionProgress(
    requirements: readonly RequirementLike[],
    placementId: string,
): { met: number; total: number; percent: number } {
    const forPlacement = requirements.filter((requirement) => requirement.placement_id === placementId);
    const met = forPlacement.filter((requirement) => requirement.is_complete).length;
    const total = forPlacement.length;
    return { met, total, percent: total === 0 ? 0 : Math.round((met / total) * 100) };
}
