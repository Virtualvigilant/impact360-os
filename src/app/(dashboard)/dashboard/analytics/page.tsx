'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, FolderKanban, TrendingUp, CheckCircle2, Clock, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { STAGE_LABELS, TRACK_LABELS } from '@/lib/utils/constants';
import { MemberProfile, Project, ProjectAssignment, Evaluation } from '@/types/database.types';

interface AnalyticsData {
  totalMembers: number;
  activeMembers: number;
  clientReadyMembers: number;
  deployedMembers: number;
  totalProjects: number;
  completedProjects: number;
  avgEvaluationScore: number;
  membersByStage: Record<string, number>;
  membersByTrack: Record<string, number>;
  retentionRate: number;
  completionRate: number;
}

export default function AnalyticsPage() {
  const { profile, isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id && isAdmin) {
      fetchAnalytics();
    }
  }, [profile?.id, isAdmin]);

  const fetchAnalytics = async () => {
    const supabase = supabaseClient();

    try {
      // Fetch all data in parallel
      const [
        { data: membersData },
        { data: projectsData },
        { data: assignmentsData },
        { data: evaluationsData },
      ] = await Promise.all([
        (supabase.from('member_profiles') as any).select('*'),
        (supabase.from('projects') as any).select('*'),
        (supabase.from('project_assignments') as any).select('*'),
        (supabase.from('evaluations') as any).select('*'),
      ]);

      const members = membersData as MemberProfile[];
      const projects = projectsData as Project[];
      const assignments = assignmentsData as ProjectAssignment[];
      const evaluations = evaluationsData as Evaluation[];

      if (!members) return;

      // Calculate metrics
      const totalMembers = members.length;
      const clientReadyMembers = members.filter((m) => m.is_client_ready).length;
      const deployedMembers = members.filter((m) => m.current_stage === 'deployed').length;

      // Active members (those who've made progress in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeMembers = members.filter(
        (m) => new Date(m.updated_at) > thirtyDaysAgo
      ).length;

      // Members by stage
      const membersByStage: Record<string, number> = {};
      members.forEach((m) => {
        membersByStage[m.current_stage] = (membersByStage[m.current_stage] || 0) + 1;
      });

      // Members by track
      const membersByTrack: Record<string, number> = {};
      members.forEach((m) => {
        if (m.track) {
          membersByTrack[m.track] = (membersByTrack[m.track] || 0) + 1;
        }
      });

      // Project metrics
      const totalProjects = projects?.length || 0;
      const completedProjects = assignments?.filter((a) => a.status === 'completed').length || 0;
      const totalAssignments = assignments?.length || 0;
      const completionRate = totalAssignments > 0
        ? (completedProjects / totalAssignments) * 100
        : 0;

      // Average evaluation score
      const avgEvaluationScore = evaluations && evaluations.length > 0
        ? evaluations.reduce((sum, e) => sum + e.average_score, 0) / evaluations.length
        : 0;

      // Retention rate (members who are still active vs total)
      const retentionRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

      setAnalytics({
        totalMembers,
        activeMembers,
        clientReadyMembers,
        deployedMembers,
        totalProjects,
        completedProjects,
        avgEvaluationScore,
        membersByStage,
        membersByTrack,
        retentionRate,
        completionRate,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            You don't have permission to view this page
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Unable to load analytics data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track performance metrics and pipeline health
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeMembers} active in last 30 days
            </p>
            <Progress value={(analytics.activeMembers / analytics.totalMembers) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Ready</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.clientReadyMembers}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.clientReadyMembers / analytics.totalMembers) * 100).toFixed(1)}% of total
            </p>
            <Progress value={(analytics.clientReadyMembers / analytics.totalMembers) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.deployedMembers}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.deployedMembers / analytics.totalMembers) * 100).toFixed(1)}% of total
            </p>
            <Progress value={(analytics.deployedMembers / analytics.totalMembers) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avgEvaluationScore > 0 ? analytics.avgEvaluationScore.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
            {analytics.avgEvaluationScore > 0 && (
              <Progress value={(analytics.avgEvaluationScore / 5) * 100} className="mt-2" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.retentionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Members active in last 30 days
            </p>
            <Progress value={analytics.retentionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.completedProjects} of {analytics.totalProjects} projects completed
            </p>
            <Progress value={analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Members by Stage */}
      <Card>
        <CardHeader>
          <CardTitle>Members by Pipeline Stage</CardTitle>
          <CardDescription>Distribution across the talent pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.membersByStage).map(([stage, count]) => (
              <div key={stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}</span>
                  <span className="text-muted-foreground">
                    {count} ({((count / analytics.totalMembers) * 100).toFixed(1)}%)
                  </span>
                </div>
                <Progress value={(count / analytics.totalMembers) * 100} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members by Track */}
      <Card>
        <CardHeader>
          <CardTitle>Members by Track</CardTitle>
          <CardDescription>Distribution across learning tracks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.membersByTrack).map(([track, count]) => (
              <div key={track} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{TRACK_LABELS[track as keyof typeof TRACK_LABELS]}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {count} member{count !== 1 ? 's' : ''}
                  </span>
                </div>
                <Progress value={(count / analytics.totalMembers) * 100} className="w-48" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Flow Chart (Text-based for now) */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Flow</CardTitle>
          <CardDescription>Member progression through stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">Intake</div>
              <div className="flex-1">
                <Progress value={(analytics.membersByStage.intake / analytics.totalMembers) * 100} />
              </div>
              <div className="w-16 text-right text-sm">{analytics.membersByStage.intake || 0}</div>
            </div>

            <div className="pl-8 text-xs text-muted-foreground">↓</div>

            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">Training</div>
              <div className="flex-1">
                <Progress value={(analytics.membersByStage.training / analytics.totalMembers) * 100} />
              </div>
              <div className="w-16 text-right text-sm">{analytics.membersByStage.training || 0}</div>
            </div>

            <div className="pl-8 text-xs text-muted-foreground">↓</div>

            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">Projects</div>
              <div className="flex-1">
                <Progress value={(analytics.membersByStage.internal_projects / analytics.totalMembers) * 100} />
              </div>
              <div className="w-16 text-right text-sm">{analytics.membersByStage.internal_projects || 0}</div>
            </div>

            <div className="pl-8 text-xs text-muted-foreground">↓</div>

            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">Evaluation</div>
              <div className="flex-1">
                <Progress value={(analytics.membersByStage.evaluation / analytics.totalMembers) * 100} />
              </div>
              <div className="w-16 text-right text-sm">{analytics.membersByStage.evaluation || 0}</div>
            </div>

            <div className="pl-8 text-xs text-muted-foreground">↓</div>

            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">Client Ready</div>
              <div className="flex-1">
                <Progress value={(analytics.membersByStage.client_ready / analytics.totalMembers) * 100} />
              </div>
              <div className="w-16 text-right text-sm">{analytics.membersByStage.client_ready || 0}</div>
            </div>

            <div className="pl-8 text-xs text-muted-foreground">↓</div>

            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium">Deployed</div>
              <div className="flex-1">
                <Progress value={(analytics.membersByStage.deployed / analytics.totalMembers) * 100} />
              </div>
              <div className="w-16 text-right text-sm">{analytics.membersByStage.deployed || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}