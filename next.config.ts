import type { NextConfig } from 'next';

/**
 * Routes from the previous Impact360 information architecture.
 *
 * These are permanent (308) rather than deleted, so bookmarks, emailed links and
 * anything a mentor pasted into a chat still land somewhere useful instead of on a 404.
 * The successor is the module that now owns that concern, not always a like-for-like
 * page — `my-tasks` became a personal workspace, `attendance` folded into operations.
 */
const LEGACY_ROUTES: Array<[from: string, to: string]> = [
    ['/dashboard/my-tasks', '/dashboard/work'],
    ['/dashboard/members', '/dashboard/people'],
    ['/dashboard/members/:id', '/dashboard/people'],
    ['/dashboard/all-projects', '/dashboard/projects'],
    ['/dashboard/submissions', '/dashboard/tasks'],
    ['/dashboard/goals', '/dashboard/development'],
    ['/dashboard/curriculum', '/dashboard/learning'],
    ['/dashboard/attendance', '/dashboard/operations'],
    ['/dashboard/documents', '/dashboard/operations'],
    ['/dashboard/deployments', '/dashboard/outcomes'],
    ['/dashboard/achievements', '/dashboard/outcomes'],
    ['/dashboard/analytics', '/dashboard/intelligence'],
    ['/dashboard/cohorts', '/dashboard/programmes'],
    ['/dashboard/cohorts/:id', '/dashboard/programmes'],
    ['/dashboard/teams', '/dashboard/projects'],
    ['/dashboard/teams/:id', '/dashboard/projects'],
    ['/dashboard/settings', '/dashboard/admin'],
];

const nextConfig: NextConfig = {
    async redirects() {
        return LEGACY_ROUTES.map(([source, destination]) => ({ source, destination, permanent: true }));
    },

    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    // The application never needs to be framed; refusing removes a
                    // clickjacking surface on the sign-in and application forms.
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'X-DNS-Prefetch-Control', value: 'on' },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
                    },
                ],
            },
        ];
    },

    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
            { protocol: 'https', hostname: 'yt3.ggpht.com', pathname: '/**' },
        ],
    },
};

export default nextConfig;
