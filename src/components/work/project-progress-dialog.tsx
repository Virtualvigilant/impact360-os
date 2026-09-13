'use client';

import { useState } from 'react';
import { Activity, CheckCircle2, Code2, ExternalLink, Globe, PlayCircle } from 'lucide-react';
import { updateProjectProgress } from '@/lib/actions/work';
import type { Tables } from '@/types/database';
import { ActionDialog, TextField } from '@/components/primitives/action-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ProjectProgressDialogProps {
    project: Pick<
        Tables<'projects'>,
        'id' | 'name' | 'status' | 'progress' | 'repository_url' | 'deployed_url'
    >;
}

export function ProjectProgressDialog({ project }: ProjectProgressDialogProps) {
    const [status, setStatus] = useState<string>(project.status);
    const [progress, setProgress] = useState<number>(project.progress);

    function handleStatusChange(newStatus: string) {
        setStatus(newStatus);
        if (newStatus === 'completed') {
            setProgress(100);
        } else if (newStatus === 'active' && progress === 0) {
            setProgress(25);
        }
    }

    return (
        <ActionDialog
            trigger={
                <Button size="sm" variant="outline" className="gap-2">
                    <Activity className="h-4 w-4" aria-hidden />
                    Update progress
                </Button>
            }
            title="Update project progress"
            description={`Update the status, delivery progress, and deliverables links for ${project.name}.`}
            action={updateProjectProgress}
            submitLabel="Save progress"
            successMessage="Project progress updated"
        >
            {(errors) => (
                <>
                    <input type="hidden" name="project_id" value={project.id} />

                    {/* Status selection */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Project Status</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'planned', label: 'Not started', icon: PlayCircle },
                                { value: 'active', label: 'In progress', icon: Activity },
                                { value: 'completed', label: 'Completed', icon: CheckCircle2 },
                            ].map((option) => {
                                const Icon = option.icon;
                                const isSelected = status === option.value;
                                return (
                                    <button
                                        type="button"
                                        key={option.value}
                                        onClick={() => handleStatusChange(option.value)}
                                        className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors ${
                                            isSelected
                                                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                                                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <input type="hidden" name="status" value={status} />
                        {errors.status && (
                            <p className="text-xs text-destructive">{errors.status.join(', ')}</p>
                        )}
                    </div>

                    {/* Progress percentage */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="progress">Progress ({progress}%)</Label>
                            <div className="flex gap-1.5">
                                {[0, 25, 50, 75, 100].map((preset) => (
                                    <button
                                        type="button"
                                        key={preset}
                                        onClick={() => setProgress(preset)}
                                        className={`rounded px-1.5 py-0.5 text-xs font-medium transition-colors ${
                                            progress === preset
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {preset}%
                                    </button>
                                ))}
                            </div>
                        </div>
                        <input
                            type="range"
                            id="progress"
                            name="progress"
                            min="0"
                            max="100"
                            step="5"
                            value={progress}
                            onChange={(e) => setProgress(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                        {errors.progress && (
                            <p className="text-xs text-destructive">{errors.progress.join(', ')}</p>
                        )}
                    </div>

                    {/* Submission Links */}
                    <div className="space-y-4 rounded-lg border border-border/80 bg-muted/30 p-4">
                        <div className="space-y-1">
                            <p className="text-sm font-semibold flex items-center gap-1.5">
                                <Code2 className="h-4 w-4 text-primary" />
                                Submission & Deliverables Links
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Submit your code repository and live deployment preview so supervisors can review your work.
                            </p>
                        </div>

                        <TextField
                            name="repository_url"
                            label="GitHub / Code Repository URL"
                            defaultValue={project.repository_url ?? ''}
                            placeholder="https://github.com/your-org/tradecity-platform"
                            errors={errors}
                            hint="Paste the link to your GitHub repository or pull request"
                        />

                        <TextField
                            name="deployed_url"
                            label="Live Site / Preview URL"
                            defaultValue={project.deployed_url ?? ''}
                            placeholder="https://tradecity-preview.vercel.app"
                            errors={errors}
                            hint="Paste the live URL where the application is deployed"
                        />
                    </div>
                </>
            )}
        </ActionDialog>
    );
}
