'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { MemberProfile, CurriculumModule } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, BookOpen, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { TRACK_LABELS, STAGE_LABELS, STAGE_COLORS } from '@/lib/utils/constants';

export default function TrackPage() {
    const { profile } = useAuth();
    const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
    const [modules, setModules] = useState<CurriculumModule[]>([]);
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<string | null>(null);

    useEffect(() => {
        if (profile?.id) {
            fetchData();
        }
    }, [profile?.id]);

    const fetchData = async () => {
        if (!profile?.id) return;
        const supabase = supabaseClient();

        try {
            // Fetch member profile
            const { data: mp } = await (supabase
                .from('member_profiles') as any)
                .select('*')
                .eq('id', profile.id)
                .single();

            if (mp) {
                setMemberProfile(mp);
                setCompletedIds(mp.completed_module_ids || []);

                // Fetch curriculum modules for this track
                const { data: modulesData } = await (supabase
                    .from('curriculum_modules') as any)
                    .select('*')
                    .eq('track', mp.track)
                    .order('order_index', { ascending: true });

                if (modulesData && modulesData.length > 0) {
                    setModules(modulesData);
                }
            }
        } catch (error) {
            console.error('Error fetching track data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleModuleCompletion = async (moduleId: string) => {
        if (!profile?.id) return;
        setToggling(moduleId);

        const isCompleted = completedIds.includes(moduleId);
        const newIds = isCompleted
            ? completedIds.filter((id) => id !== moduleId)
            : [...completedIds, moduleId];

        // Optimistic update
        setCompletedIds(newIds);

        const supabase = supabaseClient();
        try {
            const { error } = await (supabase
                .from('member_profiles') as any)
                .update({ completed_module_ids: newIds })
                .eq('id', profile.id);

            if (error) throw error;
        } catch (error: any) {
            // Revert on error
            setCompletedIds(completedIds);
            console.error('Error updating progress:', error?.message || error);
        } finally {
            setToggling(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!memberProfile?.track) {
        return (
            <Card>
                <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">
                        No track selected. Please complete your profile setup.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const completedCount = modules.filter((m) => completedIds.includes(m.id)).length;
    const progressPercent = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Learning Track</h1>
                <p className="text-muted-foreground mt-2">
                    Your personalized curriculum for {TRACK_LABELS[memberProfile.track as keyof typeof TRACK_LABELS]}
                </p>
            </div>

            {/* Track Overview */}
            {modules.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Track Progress</CardTitle>
                                <CardDescription>{TRACK_LABELS[memberProfile.track as keyof typeof TRACK_LABELS]}</CardDescription>
                            </div>
                            <Badge className={memberProfile.current_stage ? STAGE_COLORS[memberProfile.current_stage] : ''}>
                                {memberProfile.current_stage ? STAGE_LABELS[memberProfile.current_stage] : 'Unknown'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {completedCount} of {modules.length} modules completed
                                </span>
                                <span className="font-medium">
                                    {progressPercent}%
                                </span>
                            </div>
                            <Progress value={progressPercent} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Curriculum Modules */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Curriculum</h2>
                {modules.length === 0 ? (
                    <Card>
                        <CardContent className="py-8">
                            <p className="text-center text-muted-foreground">
                                No curriculum modules have been published for this track yet.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    modules.map((mod, index) => {
                        const isCompleted = completedIds.includes(mod.id);
                        const isToggling = toggling === mod.id;

                        return (
                            <Card key={mod.id} className={isCompleted ? 'border-green-500/30' : ''}>
                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        <button
                                            className="mt-1 focus:outline-none"
                                            onClick={() => toggleModuleCompletion(mod.id)}
                                            disabled={isToggling}
                                        >
                                            {isToggling ? (
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            ) : isCompleted ? (
                                                <CheckCircle2 className="h-6 w-6 text-green-500 hover:text-green-400 transition-colors" />
                                            ) : (
                                                <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                                            )}
                                        </button>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className={isCompleted ? 'line-through text-muted-foreground' : ''}>
                                                    Module {index + 1}: {mod.title}
                                                </CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{mod.duration}</Badge>
                                                    {isCompleted && (
                                                        <Badge variant="secondary" className="text-green-600">
                                                            Completed
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="ml-10 space-y-3">
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Topics Covered:</h4>
                                            <ul className="grid grid-cols-2 gap-2">
                                                {mod.topics.map((topic, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <BookOpen className="h-3 w-3 shrink-0" />
                                                        {topic}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {mod.resources && mod.resources.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium mb-2">Resources:</h4>
                                                <ul className="space-y-1">
                                                    {mod.resources.map((resource, idx) => (
                                                        <li key={idx} className="text-sm text-muted-foreground">
                                                            {resource.startsWith('http') ? (
                                                                <a
                                                                    href={resource}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 text-primary hover:underline"
                                                                >
                                                                    <ExternalLink className="h-3 w-3" />
                                                                    {resource}
                                                                </a>
                                                            ) : (
                                                                <span className="flex items-center gap-1">
                                                                    <BookOpen className="h-3 w-3" />
                                                                    {resource}
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Mark Complete Button */}
                                        <Button
                                            variant={isCompleted ? 'outline' : 'default'}
                                            size="sm"
                                            onClick={() => toggleModuleCompletion(mod.id)}
                                            disabled={isToggling}
                                            className="mt-2"
                                        >
                                            {isToggling ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : isCompleted ? (
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                            ) : (
                                                <Circle className="h-4 w-4 mr-2" />
                                            )}
                                            {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}