'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { Badge as BadgeType } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Star, Target, Zap } from 'lucide-react';

// Mock badges for now - these should be in the database
const availableBadges = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first project',
    icon: 'target',
    earned: true,
  },
  {
    id: '2',
    name: 'Code Master',
    description: 'Complete 5 projects',
    icon: 'trophy',
    earned: false,
  },
  {
    id: '3',
    name: 'Perfect Score',
    description: 'Get a 5/5 evaluation',
    icon: 'star',
    earned: false,
  },
  {
    id: '4',
    name: 'Speed Demon',
    description: 'Complete a project in under 3 days',
    icon: 'zap',
    earned: false,
  },
];

const iconMap = {
  target: Target,
  trophy: Trophy,
  star: Star,
  zap: Zap,
};

export default function AchievementsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const earnedBadges = availableBadges.filter((b) => b.earned);
  const lockedBadges = availableBadges.filter((b) => !b.earned);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground mt-2">
          Your badges and accomplishments
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnedBadges.length}</div>
            <p className="text-xs text-muted-foreground">
              {lockedBadges.length} more to unlock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((earnedBadges.length / availableBadges.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Keep going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rising Star</div>
            <p className="text-xs text-muted-foreground">Top 30%</p>
          </CardContent>
        </Card>
      </div>

      {/* Earned Badges */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Earned Badges</h2>
        {earnedBadges.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No badges earned yet. Complete projects to earn your first badge!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {earnedBadges.map((badge) => {
              const Icon = iconMap[badge.icon as keyof typeof iconMap];
              return (
                <Card key={badge.id} className="border-primary/50 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary text-primary-foreground">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{badge.name}</CardTitle>
                        <Badge className="mt-1" variant="outline">
                          Earned
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Locked Badges */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Locked Badges</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lockedBadges.map((badge) => {
            const Icon = iconMap[badge.icon as keyof typeof iconMap];
            return (
              <Card key={badge.id} className="opacity-60">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-muted">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{badge.name}</CardTitle>
                      <Badge className="mt-1" variant="secondary">
                        Locked
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}