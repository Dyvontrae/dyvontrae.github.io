import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle auth state changes
      switch (event) {
        case 'SIGNED_IN':
          router.push('/admin');
          break;
        case 'SIGNED_OUT':
          router.push('/login');
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return {
    user,
    session,
    loading,
    signIn: (email: string, password: string) => 
      supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    resetPassword: (email: string) => 
      supabase.auth.resetPasswordForEmail(email),
  };
}