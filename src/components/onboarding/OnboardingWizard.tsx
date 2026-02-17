'use client';

import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { TrackType, ExperienceLevel } from '@/types/database.types';
import {
    TRACK_LABELS,
    SKILL_OPTIONS,
    INTEREST_OPTIONS,
    EXPERIENCE_LABELS,
    EXPERIENCE_DESCRIPTIONS,
} from '@/lib/utils/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Code,
    Brain,
    Palette,
    Smartphone,
    Server,
    ChevronRight,
    ChevronLeft,
    Rocket,
    Loader2,
    CheckCircle2,
    Sparkles,
    GraduationCap,
    Target,
} from 'lucide-react';

interface OnboardingWizardProps {
    memberId: string;
    memberName: string;
    onComplete: () => void;
}

const trackIcons: Record<TrackType, React.ComponentType<{ className?: string }>> = {
    web_development: Code,
    ai_ml: Brain,
    design: Palette,
    mobile: Smartphone,
    devops: Server,
};

const trackDescriptions: Record<TrackType, string> = {
    web_development: 'Build modern web applications with React, Next.js, and more',
    ai_ml: 'Master machine learning, deep learning, and AI technologies',
    design: 'Create beautiful user interfaces and user experiences',
    mobile: 'Develop mobile apps for iOS and Android',
    devops: 'Learn infrastructure, CI/CD, and cloud technologies',
};

const STEPS = [
    { title: 'Experience', icon: GraduationCap },
    { title: 'Track', icon: Target },
    { title: 'Skills & Interests', icon: Sparkles },
    { title: 'Review', icon: Rocket },
];

export function OnboardingWizard({ memberId, memberName, onComplete }: OnboardingWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<TrackType | null>(null);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return experienceLevel !== null;
            case 1:
                return selectedTrack !== null;
            case 2:
                return selectedSkills.length > 0 && selectedInterests.length > 0;
            case 3:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const toggleSkill = (skill: string) => {
        if (skill === 'None') {
            setSelectedSkills((prev) => prev.includes('None') ? [] : ['None']);
        } else {
            setSelectedSkills((prev) => {
                const withoutNone = prev.filter((s) => s !== 'None');
                return withoutNone.includes(skill)
                    ? withoutNone.filter((s) => s !== skill)
                    : [...withoutNone, skill];
            });
        }
    };

    const toggleInterest = (interest: string) => {
        setSelectedInterests((prev) =>
            prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
        );
    };

    const handleSubmit = async () => {
        if (!selectedTrack || !experienceLevel) return;

        setLoading(true);
        const supabase = supabaseClient();

        try {
            const { error } = await (supabase
                .from('member_profiles') as any)
                .update({
                    track: selectedTrack,
                    experience_level: experienceLevel,
                    skills: selectedSkills.includes('None') ? [] : selectedSkills,
                    interests: selectedInterests,
                    current_stage: 'training',
                })
                .eq('id', memberId);

            if (error) throw error;

            onComplete();
        } catch (error) {
            console.error('Error completing onboarding:', error);
        } finally {
            setLoading(false);
        }
    };

    const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-3xl mx-auto px-4">
            {/* Progress Header */}
            <div className="w-full mb-8">
                <div className="flex items-center justify-between mb-4">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <div key={step.title} className="flex flex-col items-center gap-1 flex-1">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted
                                        ? 'bg-primary text-primary-foreground'
                                        : isActive
                                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                                            : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        <Icon className="h-5 w-5" />
                                    )}
                                </div>
                                <span
                                    className={`text-xs font-medium hidden sm:block ${isActive ? 'text-primary' : 'text-muted-foreground'
                                        }`}
                                >
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Step Content */}
            <div className="w-full">
                {/* Step 1: Experience Level */}
                {currentStep === 0 && (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Welcome, {memberName.split(' ')[0]}! 👋
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Let's get you set up. What's your experience level?
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map((level) => {
                                const isSelected = experienceLevel === level;
                                return (
                                    <Card
                                        key={level}
                                        className={`p-5 cursor-pointer transition-all border-2 ${isSelected
                                            ? 'border-primary bg-primary/5 shadow-md'
                                            : 'border-transparent hover:border-primary/30'
                                            }`}
                                        onClick={() => setExperienceLevel(level)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isSelected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground'
                                                    }`}
                                            >
                                                {level === 'beginner' ? '🌱' : level === 'intermediate' ? '🚀' : '⚡'}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{EXPERIENCE_LABELS[level]}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {EXPERIENCE_DESCRIPTIONS[level]}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Step 2: Track Selection */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">Choose Your Path 🎯</h1>
                            <p className="text-muted-foreground text-lg">
                                Pick the learning track that excites you the most
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {(Object.keys(TRACK_LABELS) as TrackType[]).map((track) => {
                                const Icon = trackIcons[track];
                                const isSelected = selectedTrack === track;

                                return (
                                    <Card
                                        key={track}
                                        className={`p-5 cursor-pointer transition-all border-2 ${isSelected
                                            ? 'border-primary bg-primary/5 shadow-md'
                                            : 'border-transparent hover:border-primary/30'
                                            }`}
                                        onClick={() => {
                                            setSelectedTrack(track);
                                            // Reset skills when track changes (since they're track-specific)
                                            setSelectedSkills([]);
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`p-3 rounded-xl ${isSelected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground'
                                                    }`}
                                            >
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{TRACK_LABELS[track]}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {trackDescriptions[track]}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Step 3: Skills & Interests */}
                {currentStep === 2 && selectedTrack && (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">Your Skills & Interests ✨</h1>
                            <p className="text-muted-foreground text-lg">
                                Select what you already know and what you're curious about
                            </p>
                        </div>

                        {/* Skills */}
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Skills You Have
                                    <span className="text-sm font-normal text-muted-foreground ml-2">
                                        (select all that apply)
                                    </span>
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Based on the {TRACK_LABELS[selectedTrack]} track
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['None', ...SKILL_OPTIONS[selectedTrack]].map((skill) => {
                                    const isSelected = selectedSkills.includes(skill);
                                    return (
                                        <Badge
                                            key={skill}
                                            variant={isSelected ? 'default' : 'outline'}
                                            className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${isSelected
                                                ? 'bg-primary hover:bg-primary/90'
                                                : 'hover:bg-primary/10 hover:border-primary'
                                                }`}
                                            onClick={() => toggleSkill(skill)}
                                        >
                                            {isSelected && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                            {skill}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Interests */}
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Areas of Interest
                                    <span className="text-sm font-normal text-muted-foreground ml-2">
                                        (pick at least 1)
                                    </span>
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    What topics excite you beyond your track?
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {INTEREST_OPTIONS.map((interest) => {
                                    const isSelected = selectedInterests.includes(interest);
                                    return (
                                        <Badge
                                            key={interest}
                                            variant={isSelected ? 'default' : 'outline'}
                                            className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${isSelected
                                                ? 'bg-primary hover:bg-primary/90'
                                                : 'hover:bg-primary/10 hover:border-primary'
                                                }`}
                                            onClick={() => toggleInterest(interest)}
                                        >
                                            {isSelected && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                            {interest}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">All Set! 🎉</h1>
                            <p className="text-muted-foreground text-lg">
                                Here's a summary of your profile. Ready to begin?
                            </p>
                        </div>

                        <Card className="p-6">
                            <div className="space-y-6">
                                {/* Experience */}
                                <div className="flex items-start gap-4">
                                    <GraduationCap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Experience Level</p>
                                        <p className="font-semibold text-lg">
                                            {experienceLevel ? EXPERIENCE_LABELS[experienceLevel] : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t" />

                                {/* Track */}
                                <div className="flex items-start gap-4">
                                    <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Learning Track</p>
                                        <p className="font-semibold text-lg">
                                            {selectedTrack ? TRACK_LABELS[selectedTrack] : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t" />

                                {/* Skills */}
                                <div className="flex items-start gap-4">
                                    <Code className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Skills</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedSkills.map((skill) => (
                                                <Badge key={skill} variant="secondary" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t" />

                                {/* Interests */}
                                <div className="flex items-start gap-4">
                                    <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Interests</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedInterests.map((interest) => (
                                                <Badge key={interest} variant="outline" className="text-xs">
                                                    {interest}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="w-full flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={currentStep === 0 ? 'invisible' : ''}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                {currentStep < STEPS.length - 1 ? (
                    <Button onClick={handleNext} disabled={!canProceed()} size="lg">
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={loading} size="lg" className="min-w-[160px]">
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Setting up...
                            </>
                        ) : (
                            <>
                                <Rocket className="h-4 w-4 mr-2" />
                                Start My Journey
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
