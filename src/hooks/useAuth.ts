import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseEnabled } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseEnabled) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase!.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    if (!isSupabaseEnabled) {
      throw new Error('Supabase not configured');
    }

    setError(null);
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });

    if (error) {
      setError(error.message);
      throw error;
    }

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase!
        .from('profiles')
        .insert({
          user_id: data.user.id,
          username,
          score: 0,
          level: 1,
          commands_executed: 0,
          agents_deployed: 0,
          achievements: []
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseEnabled) {
      throw new Error('Supabase not configured');
    }

    setError(null);
    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    if (!isSupabaseEnabled) return;

    const { error } = await supabase!.auth.signOut();
    if (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isSupabaseEnabled
  };
}