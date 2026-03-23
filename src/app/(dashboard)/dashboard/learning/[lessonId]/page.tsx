import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { TrackType } from '@/types/database.types';

interface LearningVideo {
    id: string;
    title: string;
    description: string;
    url: string;
    channelTitle: string;
    publishedAt: string;
}

interface LearningFeedResult {
    videos: LearningVideo[];
    warnings: string[];
}

async function getLearningFeed(query: string): Promise<LearningFeedResult> {
    const warnings: string[] = [];
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        warnings.push('YOUTUBE_API_KEY is not set, so videos are unavailable.');
        return { videos: [], warnings };
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

    let videos: LearningVideo[] = [];

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

    return { videos, warnings };
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

    const topic = resolvedSearchParams.topic;
    const lessonTitle = resolvedSearchParams.title || 'Learning Lesson';

    if (!topic) {
        notFound();
    }

    let customVideos: LearningVideo[] = [];
    let requiredIds: string[] = [];

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

            // Fetch module IDs and resources from Supabase for this track
            const { data: trackModules } = await (supabase
                .from('curriculum_modules') as any)
                .select('id, resources')
                .eq('track', selectedTrack);

            if (trackModules) {
                requiredIds = trackModules.map((m: { id: string }) => m.id);
                
                // Find the specific module to get its custom resources
                const currentModule = trackModules.find((m: { id: string, resources: string[] }) => m.id === lessonId);
                if (currentModule && currentModule.resources) {
                    const ytLinks = currentModule.resources.filter((r: string) => r.includes('youtube.com') || r.includes('youtu.be'));
                    customVideos = ytLinks.map((url: string, index: number) => {
                        // Very basic extraction for the override display
                        const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([^&]+)/);
                        const videoId = videoIdMatch ? videoIdMatch[1] : `custom-${index}`;
                        
                        return {
                            id: videoId,
                            title: 'Curriculum Video (Required)',
                            description: 'Admin assigned video for this module.',
                            url: url,
                            channelTitle: 'Impact360 OS',
                            publishedAt: new Date().toISOString()
                        };
                    });
                }
            }

            const allLessonsCompleted = requiredIds.length > 0 && requiredIds.every((id: string) => updatedIds.includes(id));

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

    const { videos: autoVideos, warnings } = await getLearningFeed(topic);
    
    // Combine custom overrides with the auto feed
    const displayVideos = [...customVideos, ...autoVideos].slice(0, 8); // Show up to 8 max

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
                    <CardDescription>
                        {customVideos.length > 0 ? "Curriculum required videos and related material" : "Auto-populated related videos"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {displayVideos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No related videos available right now.</p>
                    ) : (
                        displayVideos.map((video, index) => (
                            <div key={`${video.id}-${index}`} className={`rounded-lg border p-3 ${index < customVideos.length ? 'border-primary/50 bg-primary/5' : ''}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-sm">{video.title}</p>
                                    {index < customVideos.length && <Badge variant="secondary" className="text-[10px] h-5">Required</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
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

            {warnings.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {warnings.map((warning, i) => (
                        <Badge key={i} variant="outline">{warning}</Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
