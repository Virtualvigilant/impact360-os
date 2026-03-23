'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseClient } from '@/lib/supabase/client';
import { CurriculumModule, TrackType } from '@/types/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Loader2,
    Plus,
    Pencil,
    Trash2,
    GripVertical,
    BookOpen,
    X,
    Youtube,
    Eye,
    ExternalLink
} from 'lucide-react';
import { TRACK_LABELS } from '@/lib/utils/constants';
import Link from 'next/link';
import Image from 'next/image';

const TRACKS: TrackType[] = ['web_development', 'ai_ml', 'design', 'mobile', 'devops'];

interface YouTubePreview {
    id: string;
    title: string;
    description: string;
    url: string;
    thumbnail: string;
    channelTitle: string;
}

export default function CurriculumPage() {
    const { isAdmin } = useAuth();
    const [modules, setModules] = useState<CurriculumModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTrack, setActiveTrack] = useState<string>('web_development');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<CurriculumModule | null>(null);

    // Delete Confirmation State
    const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);

    // YouTube Preview State
    const [previewVideos, setPreviewVideos] = useState<YouTubePreview[]>([]);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [previewModuleId, setPreviewModuleId] = useState<string | null>(null);

    useEffect(() => {
        if (isAdmin) fetchModules();
    }, [isAdmin]);

    const fetchModules = async () => {
        const supabase = supabaseClient();
        try {
            const { data, error } = await supabase
                .from('curriculum_modules')
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

    const confirmDelete = async () => {
        if (!deleteModuleId) return;
        const supabase = supabaseClient();
        try {
            const { error } = await supabase
                .from('curriculum_modules')
                .delete()
                .eq('id', deleteModuleId);
            if (error) throw error;
            setModules((prev) => prev.filter((m) => m.id !== deleteModuleId));
        } catch (error: any) {
            console.error('Error deleting module:', error?.message || error);
        } finally {
            setDeleteModuleId(null);
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

    const loadYoutubePreview = async (mod: CurriculumModule) => {
        if (previewModuleId === mod.id) {
            // Toggle off
            setPreviewModuleId(null);
            setPreviewVideos([]);
            return;
        }

        setPreviewModuleId(mod.id);
        setPreviewLoading(true);
        setPreviewError(null);

        try {
            const res = await fetch(`/api/youtube-preview?query=${encodeURIComponent(mod.title)}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setPreviewVideos(data.videos || []);
        } catch (error: any) {
            setPreviewError(error.message || 'Failed to load preview');
        } finally {
            setPreviewLoading(false);
        }
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
                        Manage learning modules and preview exactly what members will see.
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Module
                </Button>
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

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Module List (Left Side - 3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                    <Card>
                        <CardHeader className="pb-3 border-b border-border/50 mb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">{TRACK_LABELS[activeTrack as TrackType]} Configuration</CardTitle>
                                    <CardDescription>Drag and drop support coming soon.</CardDescription>
                                </div>
                                <Badge variant="outline">{trackModules.length} modules</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {trackModules.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                                    No modules for this track yet. Add a module to start building the curriculum.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {trackModules.map((mod, index) => {
                                        const ytLinks = (mod.resources || []).filter(r => r.includes('youtube.com') || r.includes('youtu.be'));
                                        const otherResources = (mod.resources || []).filter(r => !r.includes('youtube.com') && !r.includes('youtu.be'));
                                        
                                        return (
                                        <div
                                            key={mod.id}
                                            className={`rounded-lg border transition-all ${previewModuleId === mod.id ? 'border-primary ring-1 ring-primary/20 shadow-md' : 'hover:bg-muted/30'}`}
                                        >
                                            <div className="flex items-start gap-3 p-4">
                                                <div className="text-muted-foreground mt-1 cursor-grab active:cursor-grabbing">
                                                    <GripVertical className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-semibold text-muted-foreground">
                                                            STEP {index + 1}
                                                        </span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {mod.duration}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="font-semibold text-base">{mod.title}</h3>
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {mod.topics.map((topic, idx) => (
                                                            <Badge key={idx} variant="secondary" className="text-xs font-normal">
                                                                {topic}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-4 mt-3">
                                                        {ytLinks.length > 0 && (
                                                            <p className="text-xs text-muted-foreground flex items-center">
                                                                <Youtube className="h-3.5 w-3.5 mr-1 text-red-500" />
                                                                {ytLinks.length} custom video{ytLinks.length !== 1 ? 's' : ''}
                                                            </p>
                                                        )}
                                                        {otherResources.length > 0 && (
                                                            <p className="text-xs text-muted-foreground flex items-center">
                                                                <BookOpen className="h-3.5 w-3.5 mr-1 text-blue-500" />
                                                                {otherResources.length} link{otherResources.length !== 1 ? 's' : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 items-end pt-1">
                                                    <Button
                                                        variant={previewModuleId === mod.id ? "secondary" : "ghost"}
                                                        size="sm"
                                                        className="h-8 gap-1 w-full justify-start"
                                                        onClick={() => loadYoutubePreview(mod)}
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Preview
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 gap-1 w-full justify-start"
                                                        onClick={() => openEdit(mod)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 gap-1 w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => setDeleteModuleId(mod.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* YouTube Live Preview Panel */}
                                            {previewModuleId === mod.id && (
                                                <div className="border-t bg-muted/20 p-4">
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center">
                                                        <Youtube className="h-4 w-4 mr-1 text-red-500" />
                                                        Auto-populated Member Feed Preview
                                                    </p>
                                                    
                                                    {previewLoading ? (
                                                        <div className="flex justify-center py-6">
                                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                        </div>
                                                    ) : previewError ? (
                                                        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{previewError}</p>
                                                    ) : previewVideos.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground italic">No videos found for exactly "{mod.title}".</p>
                                                    ) : (
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            {previewVideos.map((video) => (
                                                                <div key={video.id} className="flex gap-3 bg-background rounded-md p-2 border shadow-sm">
                                                                    {video.thumbnail ? (
                                                                        <div className="relative w-24 h-16 shrink-0 rounded overflow-hidden mt-0.5">
                                                                            <Image src={video.thumbnail} alt={video.title} fill className="object-cover" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-24 h-16 shrink-0 bg-muted rounded flex items-center justify-center">
                                                                            <Youtube className="h-6 w-6 text-muted-foreground/50" />
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-medium line-clamp-2 leading-tight" title={video.title}>{video.title}</p>
                                                                        <p className="text-[10px] text-muted-foreground mt-1 truncate">{video.channelTitle}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )})}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Member Preview (Right Side - 2 cols) */}
                <div className="lg:col-span-2">
                    <Card className="sticky top-24 border-primary/20 shadow-sm bg-linear-to-b from-background to-muted/10">
                        <CardHeader className="pb-4 border-b border-border/50">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Eye className="h-4 w-4 text-primary" />
                                Member Learning View
                            </CardTitle>
                            <CardDescription>
                                This is exactly how the learning steps will appear on the member's dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 px-4 bg-muted/5">
                            {trackModules.length === 0 ? (
                                <div className="text-sm space-y-3 opacity-60">
                                    {/* Skeleton placeholder */}
                                    <div className="h-20 border rounded-lg bg-background flex items-center px-4"><div className="w-3/4 h-4 bg-muted rounded"></div></div>
                                    <div className="h-20 border rounded-lg bg-background flex items-center px-4"><div className="w-1/2 h-4 bg-muted rounded"></div></div>
                                </div>
                            ) : (
                                <div className="space-y-3 relative">
                                    {/* The visual timeline line */}
                                    <div className="absolute left-4 top-4 bottom-4 w-px bg-border -z-10"></div>
                                    
                                    {trackModules.map((mod, index) => (
                                        <div
                                            key={mod.id}
                                            className="w-full text-left flex items-start justify-between gap-3 rounded-lg border bg-background p-3 shadow-sm relative"
                                        >
                                            <div className="absolute left-[-5px] top-4 w-2 h-2 rounded-full bg-primary ring-4 ring-background"></div>
                                            <div className="pl-4">
                                                <p className="text-sm font-semibold">Step {index + 1}: <span className="text-primary">{mod.title}</span></p>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-snug">
                                                    {mod.topics?.length ? mod.topics.slice(0, 3).join(', ') : mod.duration}
                                                </p>
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground/70 mt-3 inline-flex items-center gap-1 group">
                                                    Open specific lesson <ExternalLink className="h-2.5 w-2.5" />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="bg-muted/10 border-t p-3 text-xs text-center text-muted-foreground block">
                            Members click these steps to launch the dedicated video lesson page.
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Forms and Dialogs */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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

            <AlertDialog open={!!deleteModuleId} onOpenChange={() => setDeleteModuleId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the curriculum module from the platform. 
                            Members will no longer see this step in their learning dashboard.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Delete Module
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
    
    // Separate resources into youtube links and other links for better UX
    const initialYt = (editModule?.resources || []).filter(r => r.includes('youtube.com') || r.includes('youtu.be'));
    const initialOther = (editModule?.resources || []).filter(r => !r.includes('youtube.com') && !r.includes('youtu.be'));
    
    const [ytLinks, setYtLinks] = useState<string[]>(initialYt);
    const [otherLinks, setOtherLinks] = useState<string[]>(initialOther);
    
    const [newTopic, setNewTopic] = useState('');
    const [newYt, setNewYt] = useState('');
    const [newOther, setNewOther] = useState('');

    // Update state when modal opens with new data
    useEffect(() => {
        setTrack(editModule?.track || defaultTrack);
        setTitle(editModule?.title || '');
        setDuration(editModule?.duration || '');
        setTopics(editModule?.topics || []);
        setYtLinks((editModule?.resources || []).filter(r => r.includes('youtube.com') || r.includes('youtu.be')));
        setOtherLinks((editModule?.resources || []).filter(r => !r.includes('youtube.com') && !r.includes('youtu.be')));
        setNewTopic('');
        setNewYt('');
        setNewOther('');
    }, [editModule, defaultTrack]);

    const addTopic = () => {
        if (newTopic.trim()) {
            setTopics((prev) => [...prev, newTopic.trim()]);
            setNewTopic('');
        }
    };

    const addYt = () => {
        if (newYt.trim() && (newYt.includes('youtube.com') || newYt.includes('youtu.be'))) {
            setYtLinks((prev) => [...prev, newYt.trim()]);
            setNewYt('');
        }
    };
    
    const addOther = () => {
        if (newOther.trim()) {
            setOtherLinks((prev) => [...prev, newOther.trim()]);
            setNewOther('');
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !duration.trim() || topics.length === 0) return;
        setLoading(true);
        const supabase = supabaseClient();

        try {
            const finalResources = [...ytLinks, ...otherLinks];
            
            const payload = {
                track,
                title: title.trim(),
                duration: duration.trim(),
                topics,
                resources: finalResources.length > 0 ? finalResources : null,
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
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{editModule ? 'Edit Module' : 'Add Module'}</DialogTitle>
                <DialogDescription>
                    Configure the learning step. Required fields are marked with an asterisk (*).
                </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto px-1 py-2">
                {/* Left Column - Core Config */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center border-b pb-2">
                        <BookOpen className="h-4 w-4 mr-2" /> Basic Info
                    </h4>
                    
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

                    <div className="space-y-2">
                        <Label>Module Title *</Label>
                        <Input
                            placeholder="e.g., React Fundamentals"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <p className="text-[10px] text-muted-foreground">This title is used to auto-fetch YouTube tutorials.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Duration / Timeboxed Effort *</Label>
                        <Input
                            placeholder="e.g., Week 1, or 2 hours"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex justify-between">
                            <span>Tags / Topics *</span>
                            <span className="text-xs text-muted-foreground">{topics.length} added</span>
                        </Label>
                        {topics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-muted/30 rounded-md border min-h-[40px]">
                                {topics.map((topic, idx) => (
                                    <Badge key={idx} variant="secondary" className="gap-1 pr-1 pl-2">
                                        {topic}
                                        <button onClick={() => setTopics(t => t.filter((_, i) => i !== idx))} className="ml-0.5 hover:text-destructive rounded-full hover:bg-destructive/10 p-0.5">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g. Components, State..."
                                value={newTopic}
                                onChange={(e) => setNewTopic(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                            />
                            <Button type="button" variant="secondary" onClick={addTopic}>Add</Button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Media & Links */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center border-b pb-2 text-foreground/80">
                        <ExternalLink className="h-4 w-4 mr-2" /> Specific Resources (Optional)
                    </h4>
                    
                    <div className="space-y-2">
                        <Label className="flex justify-between items-center text-xs">
                            <span className="flex items-center"><Youtube className="h-3.5 w-3.5 mr-1 text-red-500" /> Explicit YouTube Overrides</span>
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 rounded">{ytLinks.length}</span>
                        </Label>
                        <p className="text-[10px] text-muted-foreground leading-tight">If you want specific videos instead of relying on the auto-search, add their URLs here.</p>
                        
                        {ytLinks.length > 0 && (
                            <div className="space-y-1 mb-2">
                                {ytLinks.map((res, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-[11px] bg-red-500/5 text-red-700 dark:text-red-400 border border-red-500/20 rounded px-2 py-1">
                                        <span className="flex-1 truncate">{res}</span>
                                        <button onClick={() => setYtLinks(l => l.filter((_, i) => i !== idx))} className="hover:text-red-600">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://youtube.com/watch?v=..."
                                value={newYt}
                                className="text-sm"
                                onChange={(e) => setNewYt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addYt())}
                            />
                            <Button type="button" variant="outline" size="sm" onClick={addYt}>Add</Button>
                        </div>
                    </div>

                    <div className="space-y-2 mt-4">
                        <Label className="flex justify-between items-center text-xs">
                            <span>Other Reference Links</span>
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 rounded">{otherLinks.length}</span>
                        </Label>
                        
                        {otherLinks.length > 0 && (
                            <div className="space-y-1 mb-2">
                                {otherLinks.map((res, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-[11px] bg-muted/50 border rounded px-2 py-1">
                                        <span className="flex-1 truncate">{res}</span>
                                        <button onClick={() => setOtherLinks(l => l.filter((_, i) => i !== idx))} className="hover:text-destructive">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://docs.link..."
                                value={newOther}
                                className="text-sm"
                                onChange={(e) => setNewOther(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOther())}
                            />
                            <Button type="button" variant="outline" size="sm" onClick={addOther}>Add</Button>
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="mt-4 border-t pt-4">
                <Button variant="ghost" onClick={() => onSuccess()}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading || !title.trim() || !duration.trim() || topics.length === 0}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editModule ? 'Save Changes' : 'Create Module'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
