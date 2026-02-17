'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Trophy, Star, Target, Zap, Flame, Shield, Award, Rocket, Heart, BookOpen } from 'lucide-react';
import {
    BadgeDefinition,
    UserStats,
    checkBadges,
    calculateTotalXp,
    calculateProgress,
    levelFromXp,
    xpProgress,
    getRank,
    CATEGORY_LABELS,
} from '@/lib/utils/badges';

const iconMap = {
    target: Target,
    trophy: Trophy,
    star: Star,
    zap: Zap,
    flame: Flame,
    shield: Shield,
    award: Award,
    rocket: Rocket,
    heart: Heart,
    book: BookOpen,
};

export default function AchievementsPage() {
    const { profile } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.id) {
            fetchStats();
        }
    }, [profile?.id]);

    const fetchStats = async () => {
        if (!profile?.id) return;
        const supabase = supabaseClient();

        try {
            // Fetch member profile
            const { data: mp } = await (supabase
                .from('member_profiles') as any)
                .select('*')
                .eq('id', profile.id)
                .single();

            if (!mp) return;

            // Fetch completed project count
            const { count: completedProjects } = await supabase
                .from('project_assignments')
                .select('*', { count: 'exact', head: true })
                .eq('member_id', profile.id)
                .eq('status', 'completed');

            // Fetch total submissions
            const { count: totalSubmissions } = await supabase
                .from('submissions')
                .select('*', { count: 'exact', head: true })
                .eq('member_id', profile.id);

            // Fetch evaluations
            const { data: evaluations } = await (supabase
                .from('evaluations') as any)
                .select('average_score')
                .eq('member_id', profile.id);

            const evaluationCount = evaluations?.length || 0;
            const averageScore = evaluationCount > 0
                ? evaluations!.reduce((sum: number, e: any) => sum + (e.average_score || 0), 0) / evaluationCount
                : 0;
            const highestScore = evaluationCount > 0
                ? Math.max(...evaluations!.map((e: any) => e.average_score || 0))
                : 0;

            // Fetch curriculum modules for this track
            const { count: totalModules } = await supabase
                .from('curriculum_modules')
                .select('*', { count: 'exact', head: true })
                .eq('track', mp.track || '');

            const completedModules = mp.completed_module_ids?.length || 0;

            // Calculate member since days
            const memberSinceDays = Math.floor(
                (Date.now() - new Date(mp.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );

            const initialStats: UserStats = {
                completedProjects: completedProjects || 0,
                totalSubmissions: totalSubmissions || 0,
                averageScore,
                highestScore,
                evaluationCount,
                completedModules,
                totalModules: totalModules || 0,
                currentStage: mp.current_stage || '',
                memberSinceDays,
                level: mp.level || 1,
                xp: mp.experience_points || 0,
                isClientReady: mp.is_client_ready || false,
            };

            // Calculate progress iteratively
            const calculatedStats = calculateProgress(initialStats);

            // If stats changed, update DB
            if (calculatedStats.xp !== mp.experience_points || calculatedStats.level !== mp.level) {
                await (supabase.from('member_profiles') as any).update({
                    experience_points: calculatedStats.xp,
                    level: calculatedStats.level
                }).eq('id', profile.id);
            }

            setStats(calculatedStats);
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load achievement data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats) {
        return (
            <Card>
                <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">
                        Unable to load achievement data.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const { earned, locked } = checkBadges(stats);
    const totalXp = calculateTotalXp(stats);
    const level = levelFromXp(totalXp);
    const progress = xpProgress(totalXp);
    const rank = getRank(level);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
                <p className="text-muted-foreground mt-2">
                    Your badges, XP, and accomplishments
                </p>
            </div>

            {/* XP & Level Card */}
            <Card className="border-primary/30 bg-linear-to-r from-primary/5 to-transparent">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Level</p>
                            <p className="text-4xl font-bold">{level}</p>
                            <p className="text-lg mt-1">{rank}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total XP</p>
                            <p className="text-3xl font-bold text-primary">{totalXp.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{progress.current} XP</span>
                            <span>{progress.needed} XP to Level {level + 1}</span>
                        </div>
                        <Progress value={progress.percent} />
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{earned.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {locked.length} more to unlock
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Projects Done</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedProjects}</div>
                        <p className="text-xs text-muted-foreground">{stats.totalSubmissions} submissions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">{stats.evaluationCount} evaluations</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Modules Done</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedModules}</div>
                        <p className="text-xs text-muted-foreground">of {stats.totalModules} total</p>
                    </CardContent>
                </Card>
            </div>

            {/* Earned Badges */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">
                    Earned Badges ({earned.length})
                </h2>
                {earned.length === 0 ? (
                    <Card>
                        <CardContent className="py-8">
                            <p className="text-center text-muted-foreground">
                                No badges earned yet. Complete projects and modules to start earning!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {earned.map((badge) => {
                            const Icon = iconMap[badge.icon];
                            return (
                                <Card key={badge.id} className="border-primary/50 bg-primary/5">
                                    <CardHeader>
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-full bg-primary text-primary-foreground">
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{badge.name}</CardTitle>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline">Earned</Badge>
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{badge.xpReward} XP
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                                            {CATEGORY_LABELS[badge.category]}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Locked Badges */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">
                    Locked Badges ({locked.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {locked.map((badge) => {
                        const Icon = iconMap[badge.icon];
                        return (
                            <Card key={badge.id} className="opacity-60">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-muted">
                                            <Icon className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{badge.name}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary">Locked</Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    +{badge.xpReward} XP
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                                        {CATEGORY_LABELS[badge.category]}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}