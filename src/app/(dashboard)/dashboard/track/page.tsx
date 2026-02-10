'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { MemberProfile } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, BookOpen, CheckCircle2, Circle } from 'lucide-react';
import { TRACK_LABELS, STAGE_LABELS, STAGE_COLORS } from '@/lib/utils/constants';

const trackCurriculum = {
  web_development: [
    {
      module: 'Foundations',
      topics: ['HTML5 & Semantic Markup', 'CSS3 & Flexbox/Grid', 'JavaScript ES6+', 'Git & GitHub'],
      duration: '2 weeks',
    },
    {
      module: 'Frontend Frameworks',
      topics: ['React Fundamentals', 'Component Patterns', 'State Management', 'React Hooks'],
      duration: '3 weeks',
    },
    {
      module: 'Full Stack Development',
      topics: ['Next.js', 'API Routes', 'Database Integration', 'Authentication'],
      duration: '4 weeks',
    },
    {
      module: 'Advanced Topics',
      topics: ['Performance Optimization', 'Testing', 'Deployment', 'Best Practices'],
      duration: '3 weeks',
    },
  ],
  ai_ml: [
    {
      module: 'Python & Data Fundamentals',
      topics: ['Python Programming', 'NumPy & Pandas', 'Data Visualization', 'Statistics'],
      duration: '3 weeks',
    },
    {
      module: 'Machine Learning Basics',
      topics: ['Supervised Learning', 'Unsupervised Learning', 'Scikit-learn', 'Model Evaluation'],
      duration: '4 weeks',
    },
    {
      module: 'Deep Learning',
      topics: ['Neural Networks', 'TensorFlow/PyTorch', 'CNNs & RNNs', 'NLP Basics'],
      duration: '4 weeks',
    },
    {
      module: 'AI Applications',
      topics: ['Computer Vision', 'Natural Language Processing', 'Model Deployment', 'MLOps'],
      duration: '3 weeks',
    },
  ],
  design: [
    {
      module: 'Design Fundamentals',
      topics: ['Color Theory', 'Typography', 'Layout & Composition', 'Design Principles'],
      duration: '2 weeks',
    },
    {
      module: 'UI Design',
      topics: ['Figma Mastery', 'Component Design', 'Design Systems', 'Prototyping'],
      duration: '3 weeks',
    },
    {
      module: 'UX Research',
      topics: ['User Research', 'Wireframing', 'User Testing', 'Accessibility'],
      duration: '3 weeks',
    },
    {
      module: 'Advanced Design',
      topics: ['Motion Design', 'Interaction Design', 'Design Handoff', 'Portfolio Building'],
      duration: '4 weeks',
    },
  ],
  mobile: [
    {
      module: 'Mobile Fundamentals',
      topics: ['Mobile UI Patterns', 'Platform Guidelines', 'React Native Basics', 'Navigation'],
      duration: '3 weeks',
    },
    {
      module: 'App Development',
      topics: ['State Management', 'API Integration', 'Local Storage', 'Push Notifications'],
      duration: '3 weeks',
    },
    {
      module: 'Native Features',
      topics: ['Camera & Media', 'Geolocation', 'Sensors', 'Native Modules'],
      duration: '3 weeks',
    },
    {
      module: 'Production',
      topics: ['Testing', 'Performance', 'App Store Deployment', 'Analytics'],
      duration: '3 weeks',
    },
  ],
  devops: [
    {
      module: 'Infrastructure Basics',
      topics: ['Linux Administration', 'Networking', 'Security Fundamentals', 'Cloud Platforms'],
      duration: '3 weeks',
    },
    {
      module: 'CI/CD',
      topics: ['Git Workflows', 'Jenkins/GitHub Actions', 'Docker', 'Automated Testing'],
      duration: '4 weeks',
    },
    {
      module: 'Cloud & Containers',
      topics: ['Kubernetes', 'AWS/Azure/GCP', 'Infrastructure as Code', 'Monitoring'],
      duration: '4 weeks',
    },
    {
      module: 'Advanced DevOps',
      topics: ['Microservices', 'Service Mesh', 'Observability', 'Security Best Practices'],
      duration: '3 weeks',
    },
  ],
};

export default function TrackPage() {
  const { profile } = useAuth();
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchMemberProfile();
    }
  }, [profile?.id]);

  const fetchMemberProfile = async () => {
    if (!profile?.id) return;

    const supabase = supabaseClient();

    try {
      const { data } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('id', profile.id)
        .single();

      if (data) setMemberProfile(data);
    } catch (error) {
      console.error('Error fetching member profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!memberProfile?.track) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No track selected. Please complete your profile setup.
          </p>
        </CardContent>
      </Card>
    );
  }

  const curriculum = trackCurriculum[memberProfile.track];
  const completedModules = 1; // This should be dynamic based on actual progress

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Track</h1>
        <p className="text-muted-foreground mt-2">
          Your personalized curriculum for {TRACK_LABELS[memberProfile.track]}
        </p>
      </div>

      {/* Track Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Track Progress</CardTitle>
              <CardDescription>{TRACK_LABELS[memberProfile.track]}</CardDescription>
            </div>
            <Badge className={memberProfile.current_stage ? STAGE_COLORS[memberProfile.current_stage] : ''}>
              {memberProfile.current_stage ? STAGE_LABELS[memberProfile.current_stage] : 'Unknown'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {completedModules} of {curriculum.length} modules completed
              </span>
              <span className="font-medium">
                {Math.round((completedModules / curriculum.length) * 100)}%
              </span>
            </div>
            <Progress value={(completedModules / curriculum.length) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Curriculum Modules */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Curriculum</h2>
        {curriculum.map((module, index) => {
          const isCompleted = index < completedModules;
          const isCurrent = index === completedModules;

          return (
            <Card key={index} className={isCurrent ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        Module {index + 1}: {module.module}
                      </CardTitle>
                      <Badge variant="outline">{module.duration}</Badge>
                    </div>
                    {isCurrent && (
                      <Badge className="mt-2" variant="default">
                        Current Module
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="ml-10">
                  <h4 className="text-sm font-medium mb-2">Topics Covered:</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {module.topics.map((topic, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}