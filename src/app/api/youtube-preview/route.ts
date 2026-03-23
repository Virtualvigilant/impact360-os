import { NextRequest, NextResponse } from 'next/server';

interface YouTubeSearchItem {
    id?: {
        videoId?: string;
    };
    snippet?: {
        title?: string;
        description?: string;
        channelTitle?: string;
        publishedAt?: string;
        thumbnails?: {
            medium?: { url?: string };
            high?: { url?: string };
        };
    };
}

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query') || '';
    const maxResults = request.nextUrl.searchParams.get('maxResults') || '4';

    if (!query.trim()) {
        return NextResponse.json({ videos: [], error: 'Missing query parameter' }, { status: 400 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        return NextResponse.json({
            videos: [],
            error: 'YOUTUBE_API_KEY is not configured on the server.',
        });
    }

    try {
        const youtubeUrl = new URL('https://www.googleapis.com/youtube/v3/search');
        youtubeUrl.searchParams.set('part', 'snippet');
        youtubeUrl.searchParams.set('type', 'video');
        youtubeUrl.searchParams.set('maxResults', maxResults);
        youtubeUrl.searchParams.set('q', `${query} tutorial`);
        youtubeUrl.searchParams.set('key', apiKey);

        const response = await fetch(youtubeUrl.toString(), {
            next: { revalidate: 3600 },
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json({
                videos: [],
                error: `YouTube API error: ${response.status}`,
                details: errorData,
            });
        }

        const data: { items?: YouTubeSearchItem[] } = await response.json();

        const videos = (data.items || [])
            .filter((item) => item.id?.videoId)
            .map((item) => ({
                id: item.id!.videoId!,
                title: item.snippet?.title || 'Untitled video',
                description: item.snippet?.description || '',
                url: `https://www.youtube.com/watch?v=${item.id!.videoId!}`,
                thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.high?.url || '',
                channelTitle: item.snippet?.channelTitle || 'Unknown channel',
                publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
            }));

        return NextResponse.json({ videos });
    } catch (error) {
        console.error('YouTube preview error:', error);
        return NextResponse.json({ videos: [], error: 'Failed to fetch YouTube videos.' });
    }
}
