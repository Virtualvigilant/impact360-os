'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { MemberProfile, Profile, ProjectAssignment, Evaluation, PipelineStage } from '@/types/database.types';
import { GrowthChart } from '@/components/charts/GrowthChart';
import { SkillsRadar } from '@/components/charts/SkillsRadar';
import { AddEvaluationDialog } from '@/components/evaluations/AddEvaluationDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Loader2,
    ArrowLeft,
    Github,
    Linkedin,
    Globe,
    Mail,
    Target,
    TrendingUp,
    FolderKanban,
    Award,
    Star,
    Calendar,
    CheckCircle2,
    Users,
} from 'lucide-react';
import { TRACK_LABELS, STAGE_LABELS, STAGE_COLORS } from '@/lib/utils/constants';
import { formatDate, getInitials } from '@/lib/utils/format';
import Link from 'next/link';

type MemberWithProfile = MemberProfile & { profile: Profile };

export default function MemberDetailPage() {
    const params = useParams();
    const { isAdmin, isMentor } = useAuth();
    const [member, setMember] = useState<MemberWithProfile | null>(null);
    const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingStage, setUpdatingStage] = useState(false);

    useEffect(() => {
        if (params.id && (isAdmin || isMentor)) {
            fetchMemberData();
        }
    }, [params.id, isAdmin, isMentor]);

    const fetchMemberData = async () => {
        const supabase = supabaseClient();
        const memberId = params.id as string;

        try {
            // Fetch member profile
            const { data: memberData, error: memberError } = await (supabase
                .from('member_profiles') as any)
                .select(`*, profile:profiles(*)`)
                .eq('id', memberId)
                .single();

            if (memberError) throw memberError;
            if (memberData) setMember(memberData as MemberWithProfile);

            // Fetch assignments
            const { data: assignmentsData } = await (supabase
                .from('project_assignments') as any)
                .select(`*, project:projects(*)`)
                .eq('member_id', memberId)
                .order('assigned_at', { ascending: false });

            if (assignmentsData) setAssignments(assignmentsData);

            if (assignmentsData) setAssignments(assignmentsData);

            // Fetch team membership
            const { data: teamData } = await (supabase
                .from('team_members') as any)
                .select('*, team:teams(*)')
                .eq('user_id', memberId);

            if (teamData) setTeams(teamData);

            // Fetch evaluations
            const { data: evaluationsData } = await (supabase
                .from('evaluations') as any)
                .select('*')
                .eq('member_id', memberId)
                .order('evaluated_at', { ascending: false });

            if (evaluationsData) setEvaluations(evaluationsData);
        } catch (error) {
            console.error('Error fetching member data:', error);
        } finally {
            setLoading(false);
        }
    };

    const changeMemberStage = async (newStage: PipelineStage) => {
        if (!member) return;
        setUpdatingStage(true);
        const supabase = supabaseClient();

        try {
            const updateData: Record<string, any> = { current_stage: newStage };
            if (newStage === 'deployed') {
                updateData.is_client_ready = true;
                updateData.client_ready_date = new Date().toISOString();
            }

            const { error } = await (supabase
                .from('member_profiles') as any)
                .update(updateData)
                .eq('id', member.id);

            if (error) throw error;

            await (supabase.from('notifications') as any).insert({
                user_id: member.id,
                title: 'Pipeline Stage Updated',
                message: `Your pipeline stage has been updated to ${STAGE_LABELS[newStage]}.`,
                type: 'stage_change',
            });

            setMember((prev) => prev ? { ...prev, current_stage: newStage, ...updateData } : prev);
        } catch (error) {
            console.error('Error changing stage:', error);
        } finally {
            setUpdatingStage(false);
        }
    };

    if (!isAdmin && !isMentor) {
        return (
            <Card>
                <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">
                        You don't have permission to view this page.
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

    if (!member) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard/members">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Members
                    </Link>
                </Button>
                <Card>
                    <CardContent className="py-8">
                        <p className="text-center text-muted-foreground">Member not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const completedProjects = assignments.filter((a) => a.status === 'completed').length;
    const avgScore =
        evaluations.length > 0
            ? evaluations.reduce((sum, e) => sum + e.average_score, 0) / evaluations.length
            : 0;

    // Pipeline progress
    const stageOrder: PipelineStage[] = ['intake', 'training', 'internal_projects', 'evaluation', 'client_ready', 'deployed'];
    const currentStageIndex = stageOrder.indexOf(member.current_stage);
    const pipelineProgress = ((currentStageIndex + 1) / stageOrder.length) * 100;

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" asChild>
                <Link href="/dashboard/members">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Members
                </Link>
            </Button>

            {/* Profile Header */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        {/* Avatar */}
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={member.profile.avatar_url} alt={member.profile.full_name} />
                            <AvatarFallback className="text-2xl">
                                {getInitials(member.profile.full_name)}
                            </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 space-y-3">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h1 className="text-2xl font-bold">{member.profile.full_name}</h1>
                                    <AddEvaluationDialog
                                        memberId={member.id}
                                        memberName={member.profile.full_name}
                                        onEvaluationAdded={fetchMemberData}
                                    />
                                </div>
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    {member.profile.email}
                                </p>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {isAdmin ? (
                                    <Select
                                        value={member.current_stage}
                                        onValueChange={(v) => changeMemberStage(v as PipelineStage)}
                                        disabled={updatingStage}
                                    >
                                        <SelectTrigger className="w-[170px] h-8 text-xs">
                                            {updatingStage ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <SelectValue />
                                            )}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(Object.keys(STAGE_LABELS) as PipelineStage[]).map((stage) => (
                                                <SelectItem key={stage} value={stage}>
                                                    {STAGE_LABELS[stage]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge className={member.current_stage ? STAGE_COLORS[member.current_stage] : ''}>
                                        {STAGE_LABELS[member.current_stage]}
                                    </Badge>
                                )}
                                {member.track && (
                                    <Badge variant="outline">{TRACK_LABELS[member.track]}</Badge>
                                )}
                                {member.is_client_ready && (
                                    <Badge variant="default" className="bg-green-600">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Client Ready
                                    </Badge>
                                )}
                                {teams.map(t => (
                                    <Badge key={t.team_id} variant="secondary" className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {t.team.name}
                                    </Badge>
                                ))}
                            </div>

                            {/* Social Links */}
                            <div className="flex gap-3">
                                {member.github_url && (
                                    <a href={member.github_url} target="_blank" rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-foreground transition-colors">
                                        <Github className="h-5 w-5" />
                                    </a>
                                )}
                                {member.linkedin_url && (
                                    <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-foreground transition-colors">
                                        <Linkedin className="h-5 w-5" />
                                    </a>
                                )}
                                {member.portfolio_url && (
                                    <a href={member.portfolio_url} target="_blank" rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-foreground transition-colors">
                                        <Globe className="h-5 w-5" />
                                    </a>
                                )}
                            </div>

                            {/* Bio */}
                            {member.bio && (
                                <p className="text-sm text-muted-foreground">{member.bio}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pipeline Progress */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Pipeline Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <Progress value={pipelineProgress} className="h-3 mb-4" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        {stageOrder.map((stage, i) => (
                            <span
                                key={stage}
                                className={`${i <= currentStageIndex ? 'text-primary font-semibold' : ''}`}
                            >
                                {STAGE_LABELS[stage]}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Level</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Level {member.level}</div>
                        <p className="text-xs text-muted-foreground">{member.experience_points} XP</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Projects</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedProjects}</div>
                        <p className="text-xs text-muted-foreground">{assignments.length} total assigned</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgScore > 0 ? avgScore.toFixed(1) : 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">{evaluations.length} evaluations</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">{formatDate(member.created_at)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Skills & Interests */}
            {((member.skills && member.skills.length > 0) || (member.interests && member.interests.length > 0)) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Skills & Interests</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {member.skills && member.skills.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-2">Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {member.skills.map((skill) => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {member.interests && member.interests.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-2">Interests</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {member.interests.map((interest) => (
                                        <Badge key={interest} variant="outline">{interest}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Growth Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <GrowthChart evaluations={evaluations} />
                <SkillsRadar evaluations={evaluations} />
            </div>

            {/* Projects & Evaluations Tabs */}
            <Tabs defaultValue="projects" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="projects">Projects ({assignments.length})</TabsTrigger>
                    <TabsTrigger value="evaluations">Evaluations ({evaluations.length})</TabsTrigger>
                </TabsList>

                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-4">
                    {assignments.length === 0 ? (
                        <Card>
                            <CardContent className="py-8">
                                <p className="text-center text-muted-foreground">No projects assigned yet</p>
                            </CardContent>
                        </Card>
                    ) : (
                        assignments.map((assignment) => (
                            <Card key={assignment.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1 flex-1">
                                            <h3 className="font-semibold">{assignment.project?.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {assignment.project?.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Assigned {formatDate(assignment.assigned_at)}
                                                {assignment.completed_at && ` · Completed ${formatDate(assignment.completed_at)}`}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={assignment.status === 'completed' ? 'default' : 'outline'}
                                            className="capitalize ml-4"
                                        >
                                            {assignment.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* Evaluations Tab */}
                <TabsContent value="evaluations" className="space-y-4">
                    {evaluations.length === 0 ? (
                        <Card>
                            <CardContent className="py-8">
                                <p className="text-center text-muted-foreground">No evaluations yet</p>
                            </CardContent>
                        </Card>
                    ) : (
                        evaluations.map((evaluation) => (
                            <Card key={evaluation.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 flex-1">
                                            {/* Score Breakdown */}
                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                                {[
                                                    { label: 'Code', value: evaluation.code_quality },
                                                    { label: 'Arch', value: evaluation.architecture },
                                                    { label: 'Problem', value: evaluation.problem_solving },
                                                    { label: 'Comms', value: evaluation.communication },
                                                    { label: 'Team', value: evaluation.teamwork },
                                                    { label: 'Reliable', value: evaluation.reliability },
                                                ].map((item) => (
                                                    <div key={item.label} className="text-center">
                                                        <p className="text-xs text-muted-foreground">{item.label}</p>
                                                        <p className="font-semibold">{item.value}/5</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Feedback */}
                                            {evaluation.feedback && (
                                                <p className="text-sm text-muted-foreground border-t pt-2 mt-2">
                                                    {evaluation.feedback}
                                                </p>
                                            )}

                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(evaluation.evaluated_at)}
                                            </p>
                                        </div>

                                        <div className="ml-4 text-center">
                                            <div className="text-2xl font-bold">{evaluation.average_score.toFixed(1)}</div>
                                            <div className="flex gap-0.5 mt-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`h-3 w-3 ${s <= Math.round(evaluation.average_score) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
