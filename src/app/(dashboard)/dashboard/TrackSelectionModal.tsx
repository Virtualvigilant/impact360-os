'use client';

import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { TrackType } from '@/types/database.types';
import { TRACK_LABELS } from '@/lib/utils/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Code, Brain, Palette, Smartphone, Server } from 'lucide-react';

interface TrackSelectionModalProps {
  isOpen: boolean;
  memberId: string;
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

export function TrackSelectionModal({ isOpen, memberId, onComplete }: TrackSelectionModalProps) {
  const [selectedTrack, setSelectedTrack] = useState<TrackType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedTrack) return;

    setLoading(true);
    const supabase = supabaseClient();

    try {
      const { error } = await (supabase
        .from('member_profiles') as any)
        .update({
          track: selectedTrack,
          current_stage: 'training',
        })
        .eq('id', memberId);

      if (error) throw error;

      onComplete();
    } catch (error) {
      console.error('Error updating track:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose Your Learning Track</DialogTitle>
          <DialogDescription>
            Select the path that aligns with your goals. You can change this later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {(Object.keys(TRACK_LABELS) as TrackType[]).map((track) => {
            const Icon = trackIcons[track];
            const isSelected = selectedTrack === track;

            return (
              <Card
                key={track}
                className={`p-4 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                  }`}
                onClick={() => setSelectedTrack(track)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{TRACK_LABELS[track]}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {trackDescriptions[track]}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selectedTrack || loading}
          className="w-full"
        >
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}