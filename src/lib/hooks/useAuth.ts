'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = supabaseClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const supabase = supabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const signOut = async () => {
    const supabase = supabaseClient();
    await supabase.auth.signOut();
  };

  return {
    user,
    profile,
    loading,
    signOut,
    isAuthenticated: !!user,
    isMember: profile?.role === 'member',
    isMentor: profile?.role === 'mentor',
    isAdmin: profile?.role === 'admin',
  };
}