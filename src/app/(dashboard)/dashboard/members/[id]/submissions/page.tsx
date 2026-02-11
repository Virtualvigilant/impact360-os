'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { Submission, MemberProfile, Profile } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Github, Globe, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import Link from 'next/link';

type MemberWithProfile = MemberProfile & {
  profile: Profile;
};

export default function MemberSubmissionsPage() {
  const params = useParams();
  const { profile, isMentor, isAdmin } = useAuth();
  const [member, setMember] = useState<MemberWithProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id && (isMentor || isAdmin) && params.id) {
      fetchData();
    }
  }, [profile?.id, isMentor, isAdmin, params.id]);

  const fetchData = async () => {
    if (!params.id) return;

    const supabase = supabaseClient();

    try {
      // Fetch member
      const { data: memberData } = await supabase
        .from('member_profiles')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('id', params.id)
        .single();

      if (memberData) setMember(memberData as MemberWithProfile);

      // Fetch submissions
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select(`
          *,
          project:projects(*)
        `)
        .eq('member_id', params.id)
        .order('submitted_at', { ascending: false });

      if (submissionsData) setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMentor && !isAdmin) {
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

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/members">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Members
        </Link>
      </Button>

      {/* Member Info */}
      {member && (
        <Card>
          <CardHeader>
            <CardTitle>{member.profile.full_name}'s Submissions</CardTitle>
            <CardDescription>
              Review and evaluate project submissions
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No submissions yet
              </p>
            </CardContent>
          </Card>
        ) : (
          submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{submission.project?.title}</CardTitle>
                    <CardDescription>
                      Submitted {formatDate(submission.submitted_at)}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Pending Review</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {submission.notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notes:</p>
                    <p className="text-sm text-muted-foreground">{submission.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {submission.github_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={submission.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {submission.demo_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={submission.demo_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="mr-2 h-4 w-4" />
                        Demo
                      </a>
                    </Button>
                  )}
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/evaluate/${submission.id}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      Evaluate
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}