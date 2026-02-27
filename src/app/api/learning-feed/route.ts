import { NextRequest, NextResponse } from 'next/server';

interface DevToArticle {
    id: number;
    title: string;
    description: string;
    url: string;
    published_at: string;
}

interface YouTubeSearchItem {
    id?: {
        videoId?: string;
    };
    snippet?: {
        title?: string;
        description?: string;
        channelTitle?: string;
        publishedAt?: string;
    };
}

function mapQueryToTag(query: string) {
    const normalized = query.toLowerCase();

    if (normalized.includes('machine learning')) return 'machinelearning';
    if (normalized.includes('neural')) return 'neuralnetworks';
    if (normalized.includes('nlp')) return 'nlp';
    if (normalized.includes('web') || normalized.includes('react') || normalized.includes('next.js') || normalized.includes('javascript')) return 'webdev';
    if (normalized.includes('mobile') || normalized.includes('react native') || normalized.includes('flutter')) return 'mobile';
    if (normalized.includes('design') || normalized.includes('ui') || normalized.includes('ux') || normalized.includes('figma')) return 'ux';
    if (normalized.includes('devops') || normalized.includes('docker') || normalized.includes('kubernetes') || normalized.includes('ci/cd')) return 'devops';

    return 'ai';
}

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query') || 'machine learning';
    const tag = mapQueryToTag(query);
    const warnings: string[] = [];

    const [devToResult, youtubeResult] = await Promise.allSettled([
        fetch(`https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&per_page=8`, {
            next: { revalidate: 3600 },
            headers: {
                Accept: 'application/json',
            },
        }),
        (async () => {
            const apiKey = process.env.YOUTUBE_API_KEY;

            if (!apiKey) {
                warnings.push('YOUTUBE_API_KEY is not set, so video lessons are currently disabled.');
                return null;
            }

            const youtubeUrl = new URL('https://www.googleapis.com/youtube/v3/search');
            youtubeUrl.searchParams.set('part', 'snippet');
            youtubeUrl.searchParams.set('type', 'video');
            youtubeUrl.searchParams.set('maxResults', '8');
            youtubeUrl.searchParams.set('q', `${query} tutorial`);
            youtubeUrl.searchParams.set('key', apiKey);

            return fetch(youtubeUrl.toString(), {
                next: { revalidate: 3600 },
                headers: {
                    Accept: 'application/json',
                },
            });
        })(),
    ]);

    let articles: Array<{
        id: number;
        title: string;
        description: string;
        url: string;
        source: string;
        publishedAt: string;
    }> = [];

    let videos: Array<{
        id: string;
        title: string;
        description: string;
        url: string;
        channelTitle: string;
        publishedAt: string;
    }> = [];

    if (devToResult.status === 'fulfilled' && devToResult.value.ok) {
        const devToData: DevToArticle[] = await devToResult.value.json();
        articles = devToData.map((article) => ({
            id: article.id,
            title: article.title,
            description: article.description,
            url: article.url,
            source: 'DEV.to',
            publishedAt: article.published_at,
        }));
    } else {
        warnings.push('Unable to load DEV.to articles at the moment.');
    }

    if (youtubeResult.status === 'fulfilled' && youtubeResult.value && youtubeResult.value.ok) {
        const youtubeData: { items?: YouTubeSearchItem[] } = await youtubeResult.value.json();
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
    } else if (youtubeResult.status === 'fulfilled' && youtubeResult.value && !youtubeResult.value.ok) {
        warnings.push('Unable to load YouTube videos right now.');
    }

    return NextResponse.json({
        articles,
        videos,
        warnings,
    });
}
