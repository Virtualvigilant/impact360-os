'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { CurriculumModule, TrackType } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Loader2,
    Plus,
    Pencil,
    Trash2,
    GripVertical,
    BookOpen,
    X,
} from 'lucide-react';
import { TRACK_LABELS } from '@/lib/utils/constants';

const TRACKS: TrackType[] = ['web_development', 'ai_ml', 'design', 'mobile', 'devops'];

export default function CurriculumPage() {
    const { isAdmin } = useAuth();
    const [modules, setModules] = useState<CurriculumModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTrack, setActiveTrack] = useState<string>('web_development');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<CurriculumModule | null>(null);

    useEffect(() => {
        if (isAdmin) fetchModules();
    }, [isAdmin]);

    const fetchModules = async () => {
        const supabase = supabaseClient();
        try {
            const { data, error } = await (supabase
                .from('curriculum_modules') as any)
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;
            if (data) setModules(data);
        } catch (error: any) {
            console.error('Error fetching modules:', error?.message || error);
        } finally {
            setLoading(false);
        }
    };

    const deleteModule = async (id: string) => {
        const supabase = supabaseClient();
        try {
            const { error } = await (supabase
                .from('curriculum_modules') as any)
                .delete()
                .eq('id', id);
            if (error) throw error;
            setModules((prev) => prev.filter((m) => m.id !== id));
        } catch (error: any) {
            console.error('Error deleting module:', error?.message || error);
        }
    };

    const openEdit = (mod: CurriculumModule) => {
        setEditingModule(mod);
        setDialogOpen(true);
    };

    const openCreate = () => {
        setEditingModule(null);
        setDialogOpen(true);
    };

    if (!isAdmin) {
        return (
            <Card>
                <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">Admin access required</p>
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

    const trackModules = modules.filter((m) => m.track === activeTrack);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Curriculum Manager</h1>
                    <p className="text-muted-foreground mt-2">
                        Create and manage learning modules for each track
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Module
                        </Button>
                    </DialogTrigger>
                    <ModuleFormDialog
                        defaultTrack={activeTrack as TrackType}
                        module={editingModule}
                        nextOrder={trackModules.length + 1}
                        onSuccess={() => {
                            setDialogOpen(false);
                            setEditingModule(null);
                            fetchModules();
                        }}
                    />
                </Dialog>
            </div>

            {/* Track Stats */}
            <div className="grid gap-4 md:grid-cols-5">
                {TRACKS.map((track) => {
                    const count = modules.filter((m) => m.track === track).length;
                    return (
                        <Card
                            key={track}
                            className={`cursor-pointer transition-colors ${activeTrack === track ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'
                                }`}
                            onClick={() => setActiveTrack(track)}
                        >
                            <CardContent className="pt-4 pb-4">
                                <p className="text-sm font-medium truncate">{TRACK_LABELS[track]}</p>
                                <p className="text-2xl font-bold">{count}</p>
                                <p className="text-xs text-muted-foreground">modules</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Module List for Active Track */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{TRACK_LABELS[activeTrack as TrackType]} Modules</CardTitle>
                        <Badge variant="outline">{trackModules.length} modules</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {trackModules.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No modules for this track yet. Click &quot;Add Module&quot; to create one.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {trackModules.map((mod, index) => (
                                <div
                                    key={mod.id}
                                    className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                                >
                                    <div className="text-muted-foreground mt-1">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                MODULE {index + 1}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {mod.duration}
                                            </Badge>
                                        </div>
                                        <h3 className="font-semibold">{mod.title}</h3>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {mod.topics.map((topic, idx) => (
                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                    {topic}
                                                </Badge>
                                            ))}
                                        </div>
                                        {mod.resources && mod.resources.length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                📎 {mod.resources.length} resource{mod.resources.length !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => openEdit(mod)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => deleteModule(mod.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
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

// --- Module Form Dialog ---

function ModuleFormDialog({
    defaultTrack,
    module: editModule,
    nextOrder,
    onSuccess,
}: {
    defaultTrack: TrackType;
    module: CurriculumModule | null;
    nextOrder: number;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [track, setTrack] = useState<TrackType>(editModule?.track || defaultTrack);
    const [title, setTitle] = useState(editModule?.title || '');
    const [duration, setDuration] = useState(editModule?.duration || '');
    const [topics, setTopics] = useState<string[]>(editModule?.topics || []);
    const [resources, setResources] = useState<string[]>(editModule?.resources || []);
    const [newTopic, setNewTopic] = useState('');
    const [newResource, setNewResource] = useState('');

    const addTopic = () => {
        if (newTopic.trim()) {
            setTopics((prev) => [...prev, newTopic.trim()]);
            setNewTopic('');
        }
    };

    const removeTopic = (index: number) => {
        setTopics((prev) => prev.filter((_, i) => i !== index));
    };

    const addResource = () => {
        if (newResource.trim()) {
            setResources((prev) => [...prev, newResource.trim()]);
            setNewResource('');
        }
    };

    const removeResource = (index: number) => {
        setResources((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!title.trim() || !duration.trim() || topics.length === 0) return;
        setLoading(true);
        const supabase = supabaseClient();

        try {
            const payload = {
                track,
                title: title.trim(),
                duration: duration.trim(),
                topics,
                resources: resources.length > 0 ? resources : null,
                order_index: editModule?.order_index ?? nextOrder,
            };

            if (editModule) {
                const { error } = await (supabase
                    .from('curriculum_modules') as any)
                    .update(payload)
                    .eq('id', editModule.id);
                if (error) throw error;
            } else {
                const { error } = await (supabase
                    .from('curriculum_modules') as any)
                    .insert(payload);
                if (error) throw error;
            }

            onSuccess();
        } catch (error: any) {
            console.error('Error saving module:', error?.message || error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{editModule ? 'Edit Module' : 'Add Module'}</DialogTitle>
                <DialogDescription>
                    {editModule ? 'Update module details' : 'Create a new curriculum module'}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {/* Track */}
                <div className="space-y-2">
                    <Label>Track *</Label>
                    <Select value={track} onValueChange={(v) => setTrack(v as TrackType)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TRACKS.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {TRACK_LABELS[t]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <Label>Module Title *</Label>
                    <Input
                        placeholder="e.g., Frontend Frameworks"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                    <Label>Duration *</Label>
                    <Input
                        placeholder="e.g., 3 weeks"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    />
                </div>

                {/* Topics */}
                <div className="space-y-2">
                    <Label>Topics * ({topics.length})</Label>
                    {topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {topics.map((topic, idx) => (
                                <Badge key={idx} variant="secondary" className="gap-1">
                                    {topic}
                                    <button onClick={() => removeTopic(idx)} className="ml-0.5 hover:text-destructive">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add a topic..."
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={addTopic}>
                            Add
                        </Button>
                    </div>
                </div>

                {/* Resources */}
                <div className="space-y-2">
                    <Label>Resources ({resources.length})</Label>
                    {resources.length > 0 && (
                        <div className="space-y-1 mb-2">
                            {resources.map((res, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                    <BookOpen className="h-3 w-3 text-muted-foreground shrink-0" />
                                    <span className="flex-1 truncate">{res}</span>
                                    <button onClick={() => removeResource(idx)} className="hover:text-destructive">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Input
                            placeholder="URL or resource name..."
                            value={newResource}
                            onChange={(e) => setNewResource(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={addResource}>
                            Add
                        </Button>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button onClick={handleSubmit} disabled={loading || !title.trim() || !duration.trim() || topics.length === 0}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editModule ? 'Update Module' : 'Create Module'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
