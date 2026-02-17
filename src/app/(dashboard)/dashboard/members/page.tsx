'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMembers, MemberWithProfile } from '@/lib/hooks/useMembers';
import { PipelineStage } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, UserPlus, Mail, ExternalLink } from 'lucide-react';
import { STAGE_LABELS, TRACK_LABELS, STAGE_COLORS } from '@/lib/utils/constants';
import { getInitials } from '@/lib/utils/format';
import Link from 'next/link';

export default function MembersPage() {
    const { profile, isAdmin, isMentor, loading: authLoading } = useAuth();
    const { members, loading: membersLoading, updateMemberStage, updatingStage } = useMembers();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStage, setFilterStage] = useState<string>('all');
    const [filterTrack, setFilterTrack] = useState<string>('all');

    // Filter members
    const filteredMembers = members.filter((member) => {
        const matchesSearch =
            member.profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.profile.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStage = filterStage === 'all' || member.current_stage === filterStage;
        const matchesTrack = filterTrack === 'all' || member.track === filterTrack;

        return matchesSearch && matchesStage && matchesTrack;
    });

    const isLoading = authLoading || membersLoading;

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-10 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-3">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-24" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!isAdmin && !isMentor) {
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

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Members</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and monitor all community members
                    </p>
                </div>
                {isAdmin && (
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{members.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">In Training</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {members.filter((m) => m.current_stage === 'training').length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Client Ready</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {members.filter((m) => m.is_client_ready).length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Deployed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {members.filter((m) => m.current_stage === 'deployed').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <Select value={filterStage} onValueChange={setFilterStage}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Stages" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stages</SelectItem>
                                <SelectItem value="intake">Intake</SelectItem>
                                <SelectItem value="training">Training</SelectItem>
                                <SelectItem value="internal_projects">Internal Projects</SelectItem>
                                <SelectItem value="evaluation">Evaluation</SelectItem>
                                <SelectItem value="client_ready">Client Ready</SelectItem>
                                <SelectItem value="deployed">Deployed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterTrack} onValueChange={setFilterTrack}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Tracks" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tracks</SelectItem>
                                <SelectItem value="web_development">Web Development</SelectItem>
                                <SelectItem value="ai_ml">AI & ML</SelectItem>
                                <SelectItem value="design">Design</SelectItem>
                                <SelectItem value="mobile">Mobile</SelectItem>
                                <SelectItem value="devops">DevOps</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Members List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Members ({filteredMembers.length})</CardTitle>
                    <CardDescription>
                        Showing {filteredMembers.length} of {members.length} members
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredMembers.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No members found matching your filters
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {filteredMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4"
                                >
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <Avatar className="h-10 w-10 md:h-12 md:w-12 shrink-0">
                                            <AvatarImage src={member.profile.avatar_url} />
                                            <AvatarFallback>
                                                {getInitials(member.profile.full_name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold truncate">{member.profile.full_name}</h3>
                                                <Badge variant="outline" className="text-xs shrink-0">
                                                    Level {member.level}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-col gap-1 mt-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1 min-w-0">
                                                    <Mail className="h-3 w-3 shrink-0" />
                                                    <span className="truncate">{member.profile.email}</span>
                                                </span>
                                                {member.github_url && (
                                                    <a
                                                        href={member.github_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 hover:text-primary w-fit"
                                                    >
                                                        <ExternalLink className="h-3 w-3 shrink-0" />
                                                        GitHub
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2 flex-wrap md:flex-nowrap pl-14 md:pl-0">
                                        {isAdmin ? (
                                            <Select
                                                value={member.current_stage}
                                                onValueChange={(value) =>
                                                    updateMemberStage(member.id, value as PipelineStage)
                                                }
                                                disabled={updatingStage === member.id}
                                            >
                                                <SelectTrigger className="w-[140px] md:w-[160px] h-8 text-xs">
                                                    {updatingStage === member.id ? (
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
                                            <Badge
                                                className={`whitespace-nowrap ${member.current_stage ? STAGE_COLORS[member.current_stage] : ''}`}
                                            >
                                                {member.current_stage ? STAGE_LABELS[member.current_stage] : 'N/A'}
                                            </Badge>
                                        )}
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            {member.track && (
                                                <Badge variant="outline" className="whitespace-nowrap">{TRACK_LABELS[member.track as keyof typeof TRACK_LABELS]}</Badge>
                                            )}
                                            {member.is_client_ready && (
                                                <Badge variant="default" className="bg-green-600 whitespace-nowrap">
                                                    Client Ready
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:ml-4 pl-14 md:pl-0">
                                        <Button variant="ghost" size="sm" asChild className="w-full md:w-auto justify-start md:justify-center">
                                            <Link href={`/dashboard/members/${member.id}`}>
                                                View Profile
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}