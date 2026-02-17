'use client';

import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { Profile, MemberProfile, Database } from '@/types/database.types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils/format';
import { toast } from 'sonner';
import { Loader2, Upload, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileEditDialogProps {
    profile: Profile;
    memberProfile: MemberProfile | null;
    onProfileUpdated: () => void;
}

export function ProfileEditDialog({ profile, memberProfile, onProfileUpdated }: ProfileEditDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fullName, setFullName] = useState(profile.full_name || '');
    const [bio, setBio] = useState(memberProfile?.bio || '');
    const [githubUrl, setGithubUrl] = useState(memberProfile?.github_url || '');
    const [linkedinUrl, setLinkedinUrl] = useState(memberProfile?.linkedin_url || '');
    const [phoneNumber, setPhoneNumber] = useState(memberProfile?.phone_number || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar_url || null);
    const router = useRouter();

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        const supabase = supabaseClient() as any;

        try {
            let avatarUrl = profile.avatar_url;

            // Upload Avatar if changed
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, avatarFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                avatarUrl = publicUrl;
            }

            // Update Auth Profile (Name, Avatar)
            const profileUpdates: Database['public']['Tables']['profiles']['Update'] = {
                full_name: fullName,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .update(profileUpdates)
                .eq('id', profile.id);

            if (profileError) throw profileError;

            // Update Member Profile (Bio, Links)
            if (memberProfile) {
                const memberUpdates: Database['public']['Tables']['member_profiles']['Update'] = {
                    bio,
                    github_url: githubUrl,
                    linkedin_url: linkedinUrl,
                    phone_number: phoneNumber,
                    updated_at: new Date().toISOString(),
                };

                const { error: memberError } = await supabase
                    .from('member_profiles')
                    .update(memberUpdates)
                    .eq('id', profile.id);

                if (memberError) throw memberError;
            }

            toast.success('Profile updated successfully');
            setOpen(false);
            onProfileUpdated();
            router.refresh();

        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your personal information and public profile details.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-24 w-24 border-4 border-muted cursor-pointer relative group">
                            <AvatarImage src={previewUrl || undefined} className="object-cover" />
                            <AvatarFallback className="text-2xl">{getInitials(fullName)}</AvatarFallback>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                <Upload className="h-6 w-6 text-white" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleAvatarChange}
                            />
                        </Avatar>
                        <Label htmlFor="avatar-upload" className="text-xs text-muted-foreground">
                            Click to change avatar
                        </Label>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Social Links</Label>
                        <div className="grid gap-2">
                            <Input
                                placeholder="GitHub URL"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                            />
                            <Input
                                placeholder="LinkedIn URL"
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                            />
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    placeholder="+254700000000"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading} className="gap-2">
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
