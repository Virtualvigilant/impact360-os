'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { MemberProfile } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Loader2,
    Briefcase,
    UserCheck,
    Rocket,
    CheckCircle2,
    Clock,
    Github,
    Linkedin,
    Globe,
} from 'lucide-react';
import { TRACK_LABELS, STAGE_LABELS, STAGE_COLORS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/format';
import { getInitials } from '@/lib/utils/format';

export default function DeploymentsPage() {
    const { isAdmin } = useAuth();
    const [members, setMembers] = useState<MemberProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (isAdmin) {
            fetchDeploymentMembers();
        }
    }, [isAdmin]);

    const fetchDeploymentMembers = async () => {
        const supabase = supabaseClient();

        try {
            // Fetch members in evaluation or deployment stages, or marked as client ready
            const { data, error } = await supabase
                .from('member_profiles')
                .select(`
          *,
          profile:profiles(*)
        `)
                .or('current_stage.eq.evaluation,current_stage.eq.deployed,is_client_ready.eq.true')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            if (data) setMembers(data);
        } catch (error) {
            console.error('Error fetching deployment members:', error);
        } finally {
            setLoading(false);
        }
    };

    const markClientReady = async (memberId: string) => {
        setUpdating(memberId);
        const supabase = supabaseClient();

        try {
            const { error } = await supabase
                .from('member_profiles')
                .update({
                    is_client_ready: true,
                    client_ready_date: new Date().toISOString(),
                    current_stage: 'deployed',
                })
                .eq('id', memberId);

            if (error) throw error;

            // Send notification
            await supabase.from('notifications').insert({
                user_id: memberId,
                title: '🎉 You\'re Client Ready!',
                message: 'Congratulations! You\'ve been marked as client-ready and added to the deployment pool.',
                type: 'stage_change',
            });

            await fetchDeploymentMembers();
        } catch (error) {
            console.error('Error marking as client ready:', error);
        } finally {
            setUpdating(null);
        }
    };

    const moveToPipeline = async (memberId: string, stage: string) => {
        setUpdating(memberId);
        const supabase = supabaseClient();

        try {
            const updateData: Record<string, any> = { current_stage: stage };
            if (stage !== 'deployed') {
                updateData.is_client_ready = false;
            }

            const { error } = await supabase
                .from('member_profiles')
                .update(updateData)
                .eq('id', memberId);

            if (error) throw error;

            await supabase.from('notifications').insert({
                user_id: memberId,
                title: 'Pipeline Stage Updated',
                message: `Your pipeline stage has been updated to ${STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}.`,
                type: 'stage_change',
            });

            await fetchDeploymentMembers();
        } catch (error) {
            console.error('Error updating stage:', error);
        } finally {
            setUpdating(null);
        }
    };

    if (!isAdmin) {
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

    const evaluationMembers = members.filter((m) => m.current_stage === 'evaluation');
    const readyMembers = members.filter((m) => m.is_client_ready);
    const deployedMembers = members.filter(
        (m) => m.current_stage === 'deployed' && !m.is_client_ready
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
                <p className="text-muted-foreground mt-2">
                    Manage client-ready members and deployment assignments
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Evaluation</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{evaluationMembers.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Awaiting client-ready assessment
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Client Ready</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{readyMembers.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            In deployment pool
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deployed</CardTitle>
                        <Rocket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deployedMembers.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Assigned to client teams
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="evaluation" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="evaluation">
                        In Evaluation ({evaluationMembers.length})
                    </TabsTrigger>
                    <TabsTrigger value="ready">
                        Client Ready ({readyMembers.length})
                    </TabsTrigger>
                    <TabsTrigger value="deployed">
                        Deployed ({deployedMembers.length})
                    </TabsTrigger>
                </TabsList>

                {/* Evaluation Tab */}
                <TabsContent value="evaluation" className="space-y-4">
                    {evaluationMembers.length === 0 ? (
                        <Card>
                            <CardContent className="py-8">
                                <p className="text-center text-muted-foreground">
                                    No members currently in the evaluation stage
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        evaluationMembers.map((member) => (
                            <MemberDeployCard
                                key={member.id}
                                member={member}
                                updating={updating === member.id}
                                actions={
                                    <Button
                                        size="sm"
                                        onClick={() => markClientReady(member.id)}
                                        disabled={updating === member.id}
                                    >
                                        {updating === member.id ? (
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                        )}
                                        Mark Client Ready
                                    </Button>
                                }
                            />
                        ))
                    )}
                </TabsContent>

                {/* Client Ready Tab */}
                <TabsContent value="ready" className="space-y-4">
                    {readyMembers.length === 0 ? (
                        <Card>
                            <CardContent className="py-8">
                                <p className="text-center text-muted-foreground">
                                    No client-ready members in the deployment pool
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        readyMembers.map((member) => (
                            <MemberDeployCard
                                key={member.id}
                                member={member}
                                updating={updating === member.id}
                                actions={
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => moveToPipeline(member.id, 'evaluation')}
                                            disabled={updating === member.id}
                                        >
                                            Back to Evaluation
                                        </Button>
                                    </div>
                                }
                            />
                        ))
                    )}
                </TabsContent>

                {/* Deployed Tab */}
                <TabsContent value="deployed" className="space-y-4">
                    {deployedMembers.length === 0 ? (
                        <Card>
                            <CardContent className="py-8">
                                <p className="text-center text-muted-foreground">
                                    No deployed members yet
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        deployedMembers.map((member) => (
                            <MemberDeployCard
                                key={member.id}
                                member={member}
                                updating={updating === member.id}
                                actions={
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => moveToPipeline(member.id, 'evaluation')}
                                        disabled={updating === member.id}
                                    >
                                        Return to Evaluation
                                    </Button>
                                }
                            />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

// ── Member Card ──

interface MemberDeployCardProps {
    member: MemberProfile;
    updating: boolean;
    actions: React.ReactNode;
}

function MemberDeployCard({ member, updating, actions }: MemberDeployCardProps) {
    const name = member.profile?.full_name || 'Unknown';
    const email = member.profile?.email || '';

    return (
        <Card className={updating ? 'opacity-60' : ''}>
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Avatar & Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={member.profile?.avatar_url} alt={name} />
                            <AvatarFallback>{getInitials(name)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold truncate">{name}</h3>
                                <Badge
                                    className={
                                        member.current_stage
                                            ? STAGE_COLORS[member.current_stage]
                                            : ''
                                    }
                                >
                                    {member.current_stage ? STAGE_LABELS[member.current_stage] : 'N/A'}
                                </Badge>
                                {member.is_client_ready && (
                                    <Badge variant="outline" className="border-green-500 text-green-600">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Client Ready
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">{email}</p>

                            {/* Meta */}
                            <div className="flex items-center gap-4 mt-2 flex-wrap">
                                {member.track && (
                                    <span className="text-xs text-muted-foreground">
                                        <Briefcase className="inline h-3 w-3 mr-1" />
                                        {TRACK_LABELS[member.track]}
                                    </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                    Level {member.level} · {member.experience_points} XP
                                </span>
                                {member.client_ready_date && (
                                    <span className="text-xs text-muted-foreground">
                                        Ready since {formatDate(member.client_ready_date)}
                                    </span>
                                )}
                            </div>

                            {/* Skills */}
                            {member.skills && member.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {member.skills.slice(0, 6).map((skill) => (
                                        <Badge key={skill} variant="secondary" className="text-xs">
                                            {skill}
                                        </Badge>
                                    ))}
                                    {member.skills.length > 6 && (
                                        <Badge variant="secondary" className="text-xs">
                                            +{member.skills.length - 6}
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/* Social Links */}
                            <div className="flex gap-3 mt-2">
                                {member.github_url && (
                                    <a
                                        href={member.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <Github className="h-4 w-4" />
                                    </a>
                                )}
                                {member.linkedin_url && (
                                    <a
                                        href={member.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <Linkedin className="h-4 w-4" />
                                    </a>
                                )}
                                {member.portfolio_url && (
                                    <a
                                        href={member.portfolio_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <Globe className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 sm:ml-auto">{actions}</div>
                </div>
            </CardContent>
        </Card>
    );
}
