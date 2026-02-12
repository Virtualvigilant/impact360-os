'use client';

import { useEffect, useState } from 'react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProjects } from '@/lib/hooks/useProjects';
import { supabaseClient } from '@/lib/supabase/client';
import { MemberProfile, Evaluation } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { STAGE_LABELS, TRACK_LABELS, STAGE_COLORS } from '@/lib/utils/constants';
import { TrendingUp, Target, Award, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
    const { profile, loading: authLoading } = useAuth();
    const { assignments, loading: projectsLoading } = useProjects(profile?.id);
    const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [profileLoading, setProfileLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const fetchProfileAndEvaluations = async () => {
        if (!profile?.id) return;
        setProfileLoading(true);
        const supabase = supabaseClient();

        try {
            // Fetch member profile
            const { data: memberData } = await (supabase
                .from('member_profiles') as any)
                .select('*')
                .eq('id', profile.id)
                .single();

            if (memberData) setMemberProfile(memberData);

            // Fetch evaluations
            const { data: evaluationsData } = await (supabase
                .from('evaluations') as any)
                .select('*')
                .eq('member_id', profile.id)
                .order('evaluated_at', { ascending: false });

            if (evaluationsData) setEvaluations(evaluationsData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && profile?.id) {
            fetchProfileAndEvaluations();
        } else if (!authLoading) {
            setProfileLoading(false);
        }
    }, [profile?.id, authLoading]);

    useEffect(() => {
        if (memberProfile && memberProfile.current_stage === 'intake') {
            setShowOnboarding(true);
        }
    }, [memberProfile]);

    const isLoading = authLoading || profileLoading || projectsLoading;

    // Loading State
    if (isLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show onboarding wizard if user is in intake stage
    if (showOnboarding && profile?.id) {
        return (
            <OnboardingWizard
                memberId={profile.id}
                memberName={profile.full_name || 'there'}
                onComplete={() => {
                    setShowOnboarding(false);
                    fetchProfileAndEvaluations();
                }}
            />
        );
    }

    // Calculate stats
    const completedProjects = assignments.filter(a => a.status === 'completed').length;
    const averageScore = evaluations.length > 0
        ? evaluations.reduce((sum, e) => sum + e.average_score, 0) / evaluations.length
        : 0;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {profile?.full_name?.split(' ')[0]}!
                </h1>
                <p className="text-muted-foreground mt-2">
                    Here's your progress overview and latest updates.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Current Stage */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Stage</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {memberProfile?.current_stage
                                ? STAGE_LABELS[memberProfile.current_stage]
                                : 'N/A'}
                        </div>
                        <Badge
                            className={`mt-2 ${memberProfile?.current_stage
                                ? STAGE_COLORS[memberProfile.current_stage]
                                : 'bg-gray-500'
                                }`}
                        >
                            {memberProfile?.track ? TRACK_LABELS[memberProfile.track] : 'No Track'}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Level */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Level</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Level {memberProfile?.level || 1}</div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {memberProfile?.experience_points || 0} XP
                        </p>
                        <Progress value={(memberProfile?.experience_points || 0) % 100} className="mt-2" />
                    </CardContent>
                </Card>

                {/* Projects Completed */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Projects Completed</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedProjects}</div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {assignments.length} total assigned
                        </p>
                    </CardContent>
                </Card>

                {/* Average Score */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {averageScore > 0 ? averageScore.toFixed(1) : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {evaluations.length} evaluation{evaluations.length !== 1 ? 's' : ''}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Active Projects */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Projects</CardTitle>
                    <CardDescription>Projects you're currently working on</CardDescription>
                </CardHeader>
                <CardContent>
                    {assignments.filter(a => a.status === 'in_progress').length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No active projects at the moment
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {assignments
                                .filter(a => a.status === 'in_progress')
                                .map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-medium">{assignment.project?.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {assignment.project?.description}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="capitalize">
                                            {assignment.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Evaluations */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Evaluations</CardTitle>
                    <CardDescription>Your latest performance reviews</CardDescription>
                </CardHeader>
                <CardContent>
                    {evaluations.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No evaluations yet
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {evaluations.slice(0, 3).map((evaluation) => (
                                <div
                                    key={evaluation.id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium">Score: {evaluation.average_score.toFixed(1)}/5</p>
                                        <p className="text-sm text-muted-foreground">
                                            {evaluation.feedback || 'No feedback provided'}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={evaluation.average_score >= 4 ? 'default' : 'secondary'}
                                    >
                                        {evaluation.average_score >= 4 ? 'Excellent' : 'Good'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}