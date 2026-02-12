'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { MemberProfile } from '@/types/database.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials } from '@/lib/utils/format';
import {
    Github,
    Linkedin,
    Globe,
    MapPin,
    Calendar,
    Trophy,
    Star,
    Code2,
    Briefcase,
    User
} from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
    const { profile, loading: authLoading } = useAuth();
    const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
    const [loadingMember, setLoadingMember] = useState(false);

    useEffect(() => {
        const fetchMemberProfile = async () => {
            if (profile?.role === 'member' && profile.id) {
                setLoadingMember(true);
                const supabase = supabaseClient();
                const { data, error } = await supabase
                    .from('member_profiles')
                    .select('*')
                    .eq('id', profile.id)
                    .single();

                if (data) {
                    setMemberProfile(data);
                }
                setLoadingMember(false);
            }
        };

        if (profile) {
            fetchMemberProfile();
        }
    }, [profile]);

    const isLoading = authLoading || loadingMember;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Skeleton className="h-[200px] w-full" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-slate-900/50 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
                <Avatar className="h-24 w-24 border-4 border-slate-800">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback className="text-2xl">{getInitials(profile.full_name)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                        <Badge variant="secondary" className="capitalize px-3 py-1">
                            {profile.role}
                        </Badge>
                        {memberProfile?.current_stage && (
                            <Badge variant="outline" className="capitalize border-primary/50 text-primary">
                                {memberProfile.current_stage.replace('_', ' ')}
                            </Badge>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                        </div>
                    </div>
                </div>

                {memberProfile && (
                    <div className="flex gap-4">
                        {/* Stats for Members */}
                        <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-white/5">
                            <div className="text-2xl font-bold text-primary">{memberProfile.level}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Level</div>
                        </div>
                        <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-white/5">
                            <div className="text-2xl font-bold text-blue-400">{memberProfile.experience_points}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">XP</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Bio & About */}
                    {memberProfile?.bio && (
                        <Card className="bg-slate-900/30 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    About
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-300 leading-relaxed">
                                    {memberProfile.bio}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Skills & Interests */}
                    {memberProfile && (
                        <Card className="bg-slate-900/30 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Code2 className="h-5 w-5 text-purple-400" />
                                    Skills & Interests
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {memberProfile.skills && memberProfile.skills.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {memberProfile.skills.map(skill => (
                                                <Badge key={skill} variant="secondary" className="bg-slate-800 hover:bg-slate-700">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {memberProfile.interests && memberProfile.interests.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Interests</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {memberProfile.interests.map(interest => (
                                                <Badge key={interest} variant="outline" className="border-slate-700 text-slate-300">
                                                    {interest}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Track Info */}
                    {memberProfile?.track && (
                        <Card className="bg-linear-to-br from-indigo-900/20 to-slate-900/50 border-indigo-500/20">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-indigo-400" />
                                    Learning Track
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold capitalize text-white mb-1">
                                    {memberProfile.track.replace('_', ' ')}
                                </div>
                                <div className="text-sm text-slate-400">
                                    Current Focus
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Connect / Links */}
                    {memberProfile && (
                        <Card className="bg-slate-900/30 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-cyan-400" />
                                    Connect
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {memberProfile.github_url && (
                                    <a
                                        href={memberProfile.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                                    >
                                        <Github className="h-5 w-5" />
                                        <span className="flex-1 truncate">GitHub Profile</span>
                                    </a>
                                )}
                                {memberProfile.linkedin_url && (
                                    <a
                                        href={memberProfile.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                                    >
                                        <Linkedin className="h-5 w-5" />
                                        <span className="flex-1 truncate">LinkedIn Profile</span>
                                    </a>
                                )}
                                {memberProfile.portfolio_url && (
                                    <a
                                        href={memberProfile.portfolio_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                                    >
                                        <Globe className="h-5 w-5" />
                                        <span className="flex-1 truncate">Portfolio</span>
                                    </a>
                                )}
                                {!memberProfile.github_url && !memberProfile.linkedin_url && !memberProfile.portfolio_url && (
                                    <div className="text-sm text-muted-foreground italic">
                                        No social links added yet.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
