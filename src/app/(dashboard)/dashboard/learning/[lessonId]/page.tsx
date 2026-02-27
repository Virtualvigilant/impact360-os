import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { TrackType } from '@/types/database.types';

type LessonConfig = {
    title: string;
    query: string;
};

type LearningFeedResponse = {
    videos: Array<{
        id: string;
        title: string;
        description: string;
        url: string;
        channelTitle: string;
        publishedAt: string;
    }>;
    warnings?: string[];
};

const LESSONS: Record<string, LessonConfig> = {
    'intro-ai': {
        title: 'Intro to AI',
        query: 'Artificial intelligence',
    },
    'machine-learning-basics': {
        title: 'Machine Learning Basics',
        query: 'Machine learning',
    },
};

const REQUIRED_LESSON_IDS_BY_TRACK: Record<TrackType, string[]> = {
    ai_ml: ['intro-ai', 'machine-learning-basics'],
    web_development: ['web-fundamentals', 'react-nextjs'],
    design: ['ui-ux-foundations', 'figma-prototyping'],
    mobile: ['mobile-fundamentals', 'react-native-flutter'],
    devops: ['devops-foundations', 'docker-cicd'],
};

async function getLearningFeed(query: string) {
    const warnings: string[] = [];
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        warnings.push('YOUTUBE_API_KEY is not set, so videos are unavailable.');
        return {
            videos: [],
            warnings,
        } as LearningFeedResponse;
    }

    const youtubeUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    youtubeUrl.searchParams.set('part', 'snippet');
    youtubeUrl.searchParams.set('type', 'video');
    youtubeUrl.searchParams.set('maxResults', '4');
    youtubeUrl.searchParams.set('q', `${query} tutorial`);
    youtubeUrl.searchParams.set('key', apiKey);

    const youtubeResponse = await fetch(youtubeUrl.toString(), {
        next: { revalidate: 3600 },
        headers: { Accept: 'application/json' },
    });

    let videos: LearningFeedResponse['videos'] = [];

    if (youtubeResponse && youtubeResponse.ok) {
        const youtubeData: { items?: Array<{ id?: { videoId?: string }; snippet?: { title?: string; description?: string; channelTitle?: string; publishedAt?: string } }> } = await youtubeResponse.json();
        videos = (youtubeData.items || [])
            .filter((item) => item.id?.videoId)
            .map((item) => ({
                id: item.id!.videoId!,
                title: item.snippet?.title || 'Untitled video',
                description: item.snippet?.description || '',
                url: `https://www.youtube.com/watch?v=${item.id!.videoId!}`,
                channelTitle: item.snippet?.channelTitle || 'Unknown channel',
                publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
            }));
    } else if (youtubeResponse && !youtubeResponse.ok) {
        warnings.push('Unable to load related videos right now.');
    }

    return {
        videos,
        warnings,
    } as LearningFeedResponse;
}

export default async function LessonPage({
    params,
    searchParams,
}: {
    params: Promise<{ lessonId: string }>;
    searchParams: Promise<{ topic?: string; title?: string }>;
}) {
    const { lessonId } = await params;
    const resolvedSearchParams = await searchParams;
    const lesson = LESSONS[lessonId];

    const topic = resolvedSearchParams.topic || lesson?.query;
    const lessonTitle = resolvedSearchParams.title || lesson?.title || 'Learning Lesson';

    if (!topic) {
        notFound();
    }

    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user?.id) {
            const { data: memberProfile } = await (supabase
                .from('member_profiles') as any)
                .select('track, current_stage, completed_module_ids')
                .eq('id', user.id)
                .single();

            const currentIds: string[] = memberProfile?.completed_module_ids || [];
            const updatedIds = Array.from(new Set([...currentIds, lessonId]));
            const selectedTrack: TrackType = memberProfile?.track || 'ai_ml';
            const requiredLessonIds = REQUIRED_LESSON_IDS_BY_TRACK[selectedTrack] || REQUIRED_LESSON_IDS_BY_TRACK.ai_ml;
            const allLessonsCompleted = requiredLessonIds.every((id) => updatedIds.includes(id));

            await (supabase.from('member_profiles') as any)
                .update({
                    completed_module_ids: updatedIds,
                    current_stage: allLessonsCompleted && memberProfile?.current_stage === 'training'
                        ? 'internal_projects'
                        : memberProfile?.current_stage,
                })
                .eq('id', user.id);
        }
    } catch (error) {
        console.error('Failed to auto-update lesson completion:', error);
    }

    const feed = await getLearningFeed(topic);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/learning">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Learning Dashboard
                    </Link>
                </Button>
                <Badge variant="outline">Dedicated Lesson View</Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{lessonTitle} - Video Lessons</CardTitle>
                    <CardDescription>Video list only</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {feed.videos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No related videos available right now.</p>
                    ) : (
                        feed.videos.map((video) => (
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

            {(feed.warnings || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {feed.warnings?.map((warning) => (
                        <Badge key={warning} variant="outline">{warning}</Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
