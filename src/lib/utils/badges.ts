import { MemberProfile } from '@/types/database.types';

export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    icon: 'target' | 'trophy' | 'star' | 'zap' | 'flame' | 'shield' | 'award' | 'rocket' | 'heart' | 'book';
    category: 'projects' | 'evaluations' | 'learning' | 'milestones';
    xpReward: number;
    criteria: (stats: UserStats) => boolean;
}

export interface UserStats {
    completedProjects: number;
    totalSubmissions: number;
    averageScore: number;
    highestScore: number;
    evaluationCount: number;
    completedModules: number;
    totalModules: number;
    currentStage: string;
    memberSinceDays: number;
    level: number;
    xp: number;
    isClientReady: boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
    // --- Project Badges ---
    {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Submit your first project',
        icon: 'target',
        category: 'projects',
        xpReward: 50,
        criteria: (s) => s.totalSubmissions >= 1,
    },
    {
        id: 'project_streak',
        name: 'Project Streak',
        description: 'Complete 3 projects',
        icon: 'flame',
        category: 'projects',
        xpReward: 150,
        criteria: (s) => s.completedProjects >= 3,
    },
    {
        id: 'code_master',
        name: 'Code Master',
        description: 'Complete 5 projects',
        icon: 'trophy',
        category: 'projects',
        xpReward: 300,
        criteria: (s) => s.completedProjects >= 5,
    },
    {
        id: 'prolific_builder',
        name: 'Prolific Builder',
        description: 'Complete 10 projects',
        icon: 'rocket',
        category: 'projects',
        xpReward: 500,
        criteria: (s) => s.completedProjects >= 10,
    },

    // --- Evaluation Badges ---
    {
        id: 'first_review',
        name: 'First Review',
        description: 'Receive your first evaluation',
        icon: 'star',
        category: 'evaluations',
        xpReward: 50,
        criteria: (s) => s.evaluationCount >= 1,
    },
    {
        id: 'perfect_score',
        name: 'Perfect Score',
        description: 'Get a 5/5 average on an evaluation',
        icon: 'award',
        category: 'evaluations',
        xpReward: 250,
        criteria: (s) => s.highestScore >= 5,
    },
    {
        id: 'consistent_performer',
        name: 'Consistent Performer',
        description: 'Maintain an average score of 4+ across 3 evaluations',
        icon: 'shield',
        category: 'evaluations',
        xpReward: 200,
        criteria: (s) => s.evaluationCount >= 3 && s.averageScore >= 4,
    },

    // --- Learning Badges ---
    {
        id: 'eager_learner',
        name: 'Eager Learner',
        description: 'Complete your first curriculum module',
        icon: 'book',
        category: 'learning',
        xpReward: 75,
        criteria: (s) => s.completedModules >= 1,
    },
    {
        id: 'halfway_there',
        name: 'Halfway There',
        description: 'Complete 50% of your track curriculum',
        icon: 'zap',
        category: 'learning',
        xpReward: 200,
        criteria: (s) => s.totalModules > 0 && s.completedModules >= Math.ceil(s.totalModules / 2),
    },
    {
        id: 'curriculum_complete',
        name: 'Curriculum Complete',
        description: 'Complete 100% of your track curriculum',
        icon: 'trophy',
        category: 'learning',
        xpReward: 500,
        criteria: (s) => s.totalModules > 0 && s.completedModules >= s.totalModules,
    },

    // --- Milestone Badges ---
    {
        id: 'level_5',
        name: 'Rising Star',
        description: 'Reach level 5',
        icon: 'star',
        category: 'milestones',
        xpReward: 100,
        criteria: (s) => s.level >= 5,
    },
    {
        id: 'level_10',
        name: 'Veteran',
        description: 'Reach level 10',
        icon: 'shield',
        category: 'milestones',
        xpReward: 300,
        criteria: (s) => s.level >= 10,
    },
    {
        id: 'client_ready',
        name: 'Client Ready',
        description: 'Be marked as client-ready by an admin',
        icon: 'rocket',
        category: 'milestones',
        xpReward: 400,
        criteria: (s) => s.isClientReady,
    },
    {
        id: 'deployed',
        name: 'Deployed!',
        description: 'Get deployed to a client project',
        icon: 'heart',
        category: 'milestones',
        xpReward: 500,
        criteria: (s) => s.currentStage === 'deployed',
    },
    {
        id: 'one_month',
        name: '30-Day Warrior',
        description: 'Be a member for 30 days',
        icon: 'flame',
        category: 'milestones',
        xpReward: 50,
        criteria: (s) => s.memberSinceDays >= 30,
    },
];

export const CATEGORY_LABELS: Record<string, string> = {
    projects: 'Projects',
    evaluations: 'Evaluations',
    learning: 'Learning',
    milestones: 'Milestones',
};

/**
 * Calculate XP needed for a given level.
 * Level 1 = 0 XP, Level 2 = 100 XP, etc. (grows quadratically)
 */
export function xpForLevel(level: number): number {
    return Math.floor(100 * Math.pow(level - 1, 1.5));
}

/**
 * Calculate current level from total XP.
 */
export function levelFromXp(xp: number): number {
    let level = 1;
    while (xpForLevel(level + 1) <= xp) {
        level++;
    }
    return level;
}

/**
 * Calculate XP progress within current level.
 */
export function xpProgress(xp: number): { current: number; needed: number; percent: number } {
    const level = levelFromXp(xp);
    const currentLevelXp = xpForLevel(level);
    const nextLevelXp = xpForLevel(level + 1);
    const current = xp - currentLevelXp;
    const needed = nextLevelXp - currentLevelXp;
    return {
        current,
        needed,
        percent: needed > 0 ? Math.round((current / needed) * 100) : 100,
    };
}

/**
 * Check which badges the user has earned based on their stats.
 */
export function checkBadges(stats: UserStats): { earned: BadgeDefinition[]; locked: BadgeDefinition[] } {
    const earned: BadgeDefinition[] = [];
    const locked: BadgeDefinition[] = [];

    for (const badge of BADGE_DEFINITIONS) {
        if (badge.criteria(stats)) {
            earned.push(badge);
        } else {
            locked.push(badge);
        }
    }

    return { earned, locked };
}

/**
 * Calculate total XP from earned badges + base activity XP.
 */
export function calculateTotalXp(stats: UserStats): number {
    let xp = 0;

    // XP from earned badges
    for (const badge of BADGE_DEFINITIONS) {
        if (badge.criteria(stats)) {
            xp += badge.xpReward;
        }
    }

    // Base XP from activities
    xp += stats.completedProjects * 100;  // 100 XP per completed project
    xp += stats.totalSubmissions * 25;     // 25 XP per submission
    xp += stats.evaluationCount * 50;      // 50 XP per evaluation received
    xp += stats.completedModules * 75;     // 75 XP per module completed

    return xp;
}

/**
 * Iteratively calculate progress to handle dependencies between level and badges.
 * e.g. Gaining XP -> Level Up -> Earn "Level 5" Badge -> More XP
 */
export function calculateProgress(stats: UserStats): UserStats {
    let currentStats = { ...stats };
    let iterations = 0;

    // Run up to 5 passes to stabilize stats
    while (iterations < 5) {
        const xp = calculateTotalXp(currentStats);
        const level = levelFromXp(xp);

        // If stable, break
        if (Math.abs(xp - currentStats.xp) < 1 && level === currentStats.level) {
            break;
        }

        currentStats.xp = xp;
        currentStats.level = level;
        iterations++;
    }

    return currentStats;
}

/**
 * Get the rank title based on level.
 */
export function getRank(level: number): string {
    if (level >= 20) return '🏆 Legend';
    if (level >= 15) return '💎 Diamond';
    if (level >= 10) return '🥇 Gold';
    if (level >= 7) return '🥈 Silver';
    if (level >= 4) return '🥉 Bronze';
    if (level >= 2) return '⭐ Rising Star';
    return '🌱 Newcomer';
}
