'use client';

import { LogOut, Menu, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/useAuth';
import { getInitials } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

interface DashboardHeaderProps {
    onMenuClick: (type: 'mobile' | 'desktop') => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
    const { profile, signOut } = useAuth();

    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/30 backdrop-blur-md">
            <div className="flex h-16 items-center gap-4 px-4 md:px-6">
                {/* Mobile Menu Button */}
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => onMenuClick('mobile')}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Desktop Sidebar Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex text-muted-foreground hover:text-foreground"
                    onClick={() => onMenuClick('desktop')}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
                    <div className="relative h-8 w-8 rounded-lg overflow-hidden">
                        <Image
                            src="/logo.png"
                            alt="Impact360 OS Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="hidden md:inline-block">Impact360 OS</span>
                </Link>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <NotificationDropdown />

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar>
                                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                                    <AvatarFallback>
                                        {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {profile?.full_name}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {profile?.email}
                                    </p>
                                    <Badge variant="secondary" className="w-fit mt-1 capitalize">
                                        {profile?.role}
                                    </Badge>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/profile" className="cursor-pointer w-full flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut} className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}