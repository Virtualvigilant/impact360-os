'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProjects } from '@/lib/hooks/useProjects';
import { supabaseClient } from '@/lib/supabase/client';
import { CurriculumModule, MemberProfile, TrackType } from '@/types/database.types';
import { TRACK_LABELS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, ExternalLink } from 'lucide-react';

interface LearningStep {
    id: string;
    title: string;
    query: string;
    description: string;
}

interface LearningArticle {
    id: number;
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
}

interface LearningVideo {
    id: string;
    title: string;
    description: string;
    url: string;
    channelTitle: string;
    publishedAt: string;
}

interface LearningFeedResponse {
    articles: LearningArticle[];
    videos: LearningVideo[];
    warnings?: string[];
}

const DEFAULT_LEARNING_STEPS: LearningStep[] = [
    {
        id: 'intro-ai',
        title: 'Intro to AI',
        query: 'Artificial intelligence',
        description: 'Foundational concepts, history, and real-world use cases.',
    },
    {
        id: 'machine-learning-basics',
        title: 'Machine Learning Basics',
        query: 'Machine learning',
        description: 'Core ML concepts, model training, and prediction workflows.',
    },
];

const TRACK_LEARNING_STEPS: Record<TrackType, LearningStep[]> = {
    ai_ml: [
        {
            id: 'intro-ai',
            title: 'Intro to AI',
            query: 'Artificial intelligence',
            description: 'Foundational concepts, history, and real-world AI use cases.',
        },
        {
            id: 'machine-learning-basics',
            title: 'Machine Learning Basics',
            query: 'Machine learning',
            description: 'Model training, supervised learning, and prediction workflows.',
        },
    ],
    web_development: [
        {
            id: 'web-fundamentals',
            title: 'Web Development Fundamentals',
            query: 'Web development fundamentals',
            description: 'HTML, CSS, JavaScript fundamentals for beginners.',
        },
        {
            id: 'react-nextjs',
            title: 'React & Next.js',
            query: 'React Next.js tutorial',
            description: 'Build modern frontend apps using React and Next.js.',
        },
    ],
    design: [
        {
            id: 'ui-ux-foundations',
            title: 'UI/UX Foundations',
            query: 'UI UX design fundamentals',
            description: 'Design principles, user journeys, and interface basics.',
        },
        {
            id: 'figma-prototyping',
            title: 'Figma & Prototyping',
            query: 'Figma prototyping tutorial',
            description: 'Wireframes, components, and prototype workflows.',
        },
    ],
    mobile: [
        {
            id: 'mobile-fundamentals',
            title: 'Mobile Development Fundamentals',
            query: 'Mobile app development basics',
            description: 'Core concepts for building iOS and Android apps.',
        },
        {
            id: 'react-native-flutter',
            title: 'React Native / Flutter',
            query: 'React Native Flutter tutorial',
            description: 'Cross-platform app development workflows.',
        },
    ],
    devops: [
        {
            id: 'devops-foundations',
            title: 'DevOps Foundations',
            query: 'DevOps fundamentals tutorial',
            description: 'CI/CD, infrastructure, and automation basics.',
        },
        {
            id: 'docker-cicd',
            title: 'Docker & CI/CD',
            query: 'Docker CI CD pipeline tutorial',
            description: 'Containerization and deployment pipelines.',
        },
    ],
};

function getNextSaturday() {
    const now = new Date();
    const next = new Date(now);
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
    next.setDate(now.getDate() + daysUntilSaturday);
    return next;
}

export default function LearningDashboardPage() {
    const { profile } = useAuth();
    const { assignments, loading: assignmentsLoading } = useProjects(profile?.id);

    const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
    const [modules, setModules] = useState<CurriculumModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [learningFeed, setLearningFeed] = useState<LearningFeedResponse>({ articles: [], videos: [] });
    const [feedLoading, setFeedLoading] = useState(true);
    const [feedError, setFeedError] = useState<string | null>(null);
    const selectedTrack: TrackType = memberProfile?.track || 'ai_ml';

    const learningSteps: LearningStep[] = useMemo(() => {
        const baseSteps = TRACK_LEARNING_STEPS[selectedTrack] || DEFAULT_LEARNING_STEPS;

        return baseSteps.map((step, index) => {
            const module = modules[index];
            if (!module) return step;

            return {
                ...step,
                title: module.title || step.title,
                description: module.topics?.length
                    ? module.topics.slice(0, 3).join(', ')
                    : step.description,
            };
        });
    }, [modules, selectedTrack]);

    const feedQuery = useMemo(() => learningSteps[0]?.query || 'machine learning', [learningSteps]);

    useEffect(() => {
        const fetchLearningData = async () => {
            if (!profile?.id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const supabase = supabaseClient();

            try {
                const { data: memberData, error: memberError } = await (supabase
                    .from('member_profiles') as any)
                    .select('*')
                    .eq('id', profile.id)
                    .single();

                if (memberError) throw memberError;

                setMemberProfile(memberData as MemberProfile);

                if (memberData?.track) {
                    const { data: modulesData, error: modulesError } = await (supabase
                        .from('curriculum_modules') as any)
                        .select('*')
                        .eq('track', memberData.track)
                        .order('order_index', { ascending: true });

                    if (modulesError) throw modulesError;
                    setModules((modulesData || []) as CurriculumModule[]);
                }
            } catch (error) {
                console.error('Error loading learning dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLearningData();
    }, [profile?.id]);

    useEffect(() => {
        const fetchLearningFeed = async () => {
            setFeedLoading(true);
            setFeedError(null);

            try {
                const response = await fetch(`/api/learning-feed?query=${encodeURIComponent(feedQuery)}`);

                if (!response.ok) {
                    throw new Error(`Learning feed request failed: ${response.status}`);
                }

                const data: LearningFeedResponse = await response.json();
                setLearningFeed(data);
            } catch (error) {
                console.error('Error loading learning feed:', error);
                setFeedError('Unable to load external learning feed right now.');
            } finally {
                setFeedLoading(false);
            }
        };

        fetchLearningFeed();
    }, [feedQuery]);

    const completedModuleIds = memberProfile?.completed_module_ids || [];
    const completedLessons = learningSteps.filter((step) => completedModuleIds.includes(step.id)).length;
    const progressPercent = learningSteps.length ? Math.round((completedLessons / learningSteps.length) * 100) : 0;
    const activeAssignments = assignments.filter((item) => item.status === 'in_progress').length;
    const submittedAssignments = assignments.filter((item) => item.status === 'submitted' || item.status === 'under_review').length;

    const nextWorkshopDate = useMemo(() => getNextSaturday(), []);
    const currentWeek = Math.max(1, Math.ceil(completedLessons / 2) || 1);

    if (loading || assignmentsLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-10 w-80 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-5 w-32" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-24 mb-2" />
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardContent className="pt-6 space-y-3">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Learning Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Structured weekly learning with live workshop rhythm, similar to a bootcamp flow.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Track Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progressPercent}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {completedLessons} of {learningSteps.length} lessons completed
                        </p>
                        <Progress value={progressPercent} className="mt-3" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Current Sprint</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Week {currentWeek}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {memberProfile?.track ? TRACK_LABELS[memberProfile.track] : 'Track not selected'}
                        </p>
                        <Badge variant="outline" className="mt-3">Self-paced + Weekend Workshop</Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Workshop</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDate(nextWorkshopDate.toISOString())}</div>
                        <p className="text-xs text-muted-foreground mt-1">Saturday live session with mentor support</p>
                        <Badge className="mt-3">2:00 PM - 4:00 PM</Badge>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            This Week Learning Plan
                        </CardTitle>
                        <CardDescription>Click a step to load full lesson content</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {learningSteps.map((step, index) => {
                            const isDone = completedModuleIds.includes(step.id);

                            return (
                                <div
                                    key={step.id}
                                    className="w-full text-left flex items-start justify-between gap-4 rounded-lg border p-4 hover:bg-muted/40 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium">Step {index + 1}: {step.title}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                                        <Button variant="link" className="px-0 h-auto mt-2" asChild>
                                            <Link href={`/dashboard/learning/${step.id}?topic=${encodeURIComponent(step.query)}&title=${encodeURIComponent(step.title)}`}>
                                                Open full lesson page <ExternalLink className="ml-1 h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </div>
                                    <Badge variant={isDone ? 'default' : 'secondary'}>
                                        {isDone ? 'Completed' : 'Pending'}
                                    </Badge>
                                </div>
                            );
                        })}

                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lesson Experience</CardTitle>
                        <CardDescription>Each step now opens a dedicated page for easier reading.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Click Step 1 or Step 2 in the learning plan to open full content in a separate lesson page.
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Project-Based Learning Progress</CardTitle>
                    <CardDescription>Your hands-on project execution status</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Active Projects</p>
                        <p className="text-2xl font-bold mt-1">{activeAssignments}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Submitted / Review</p>
                        <p className="text-2xl font-bold mt-1">{submittedAssignments}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Completed Projects</p>
                        <p className="text-2xl font-bold mt-1">
                            {assignments.filter((item) => item.status === 'completed').length}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Live AI Learning Feed</CardTitle>
                    <CardDescription>Articles and videos from trusted APIs based on your current lesson</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {feedLoading ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    ) : feedError ? (
                        <p className="text-sm text-destructive">{feedError}</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Tutorial Articles (DEV.to)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {learningFeed.articles.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No articles found for this lesson yet.</p>
                                    ) : (
                                        learningFeed.articles.slice(0, 4).map((article) => (
                                            <div key={article.id} className="rounded-lg border p-3">
                                                <p className="font-medium text-sm">{article.title}</p>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.description || 'No summary available.'}</p>
                                                <Button variant="link" className="px-0 h-auto mt-2" asChild>
                                                    <Link href={article.url} target="_blank" rel="noreferrer">
                                                        Read article <ExternalLink className="ml-1 h-3 w-3" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Video Lessons (YouTube)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {learningFeed.videos.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No videos available. Add YOUTUBE_API_KEY to enable this feed.</p>
                                    ) : (
                                        learningFeed.videos.slice(0, 4).map((video) => (
                                            <div key={video.id} className="rounded-lg border p-3">
                                                <p className="font-medium text-sm">{video.title}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{video.channelTitle}</p>
                                                <Button variant="link" className="px-0 h-auto mt-2" asChild>
                                                    <Link href={video.url} target="_blank" rel="noreferrer">
                                                        Watch lesson <ExternalLink className="ml-1 h-3 w-3" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {(learningFeed.warnings || []).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {learningFeed.warnings?.map((warning) => (
                                <Badge key={warning} variant="outline">{warning}</Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
