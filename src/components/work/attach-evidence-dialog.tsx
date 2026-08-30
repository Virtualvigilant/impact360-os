'use client';

import { Paperclip } from 'lucide-react';
import { attachEvidence } from '@/lib/actions/work';
import type { TaskRow } from '@/lib/data/work';
import { ActionDialog, AreaField, SelectField, TextField } from '@/components/primitives/action-form';
import { Button } from '@/components/ui/button';

const EVIDENCE_TYPES = [
    'repository', 'commit', 'pull_request', 'design', 'prototype', 'document',
    'dataset', 'notebook', 'experiment', 'demo', 'report', 'certificate', 'other',
] as const;

export function AttachEvidenceDialog({ placementId, tasks }: { placementId: string; tasks: TaskRow[] }) {
    return (
        <ActionDialog
            trigger={
                <Button variant="outline">
                    <Paperclip className="mr-2 h-4 w-4" aria-hidden />
                    Attach evidence
                </Button>
            }
            title="Attach evidence"
            description="Evidence is what turns an internship into a professional record — a repository, a design file, a report someone can actually open."
            action={attachEvidence}
            submitLabel="Attach"
            successMessage="Evidence attached"
        >
            {(errors) => (
                <>
                    <input type="hidden" name="placement_id" value={placementId} />
                    <SelectField
                        name="task_id"
                        label="Related task"
                        errors={errors}
                        options={[
                            { value: '', label: 'Not tied to a specific task' },
                            ...tasks.map((task) => ({ value: task.id, label: `${task.task_number} · ${task.title}` })),
                        ]}
                    />
                    <SelectField
                        name="evidence_type"
                        label="Type"
                        errors={errors}
                        defaultValue="repository"
                        options={EVIDENCE_TYPES.map((type) => ({
                            value: type,
                            label: type.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase()),
                        }))}
                    />
                    <TextField name="title" label="Title" errors={errors} required />
                    <AreaField
                        name="description"
                        label="What is it, and what did you do?"
                        errors={errors}
                        hint="Be specific about your own contribution — this is what an evaluator reads."
                    />
                    <TextField
                        name="url"
                        label="Link"
                        type="url"
                        errors={errors}
                        hint="A repository, pull request, design file or published document."
                    />
                </>
            )}
        </ActionDialog>
    );
}
