import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AuthUser, UserRole, getRoleDashboardPath } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectPath?: string }>;
  signup: (email: string, password: string, name: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabase.rpc('get_user_role', { _user_id: userId });
  if (error || !data) return 'user';
  return data as UserRole;
}

async function buildAuthUser(supabaseUser: User): Promise<AuthUser> {
  const role = await fetchUserRole(supabaseUser.id);
  
  // Try to get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, phone, avatar_url, address')
    .eq('user_id', supabaseUser.id)
    .maybeSingle();

  return {
    id: supabaseUser.id,
    name: profile?.name || supabaseUser.user_metadata?.name || supabaseUser.email || '',
    email: profile?.email || supabaseUser.email || '',
    phone: profile?.phone || '',
    avatar: profile?.avatar_url || undefined,
    role,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid potential deadlock with Supabase client
        setTimeout(async () => {
          const authUser = await buildAuthUser(session.user);
          setUser(authUser);
          setIsLoading(false);
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // THEN check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const authUser = await buildAuthUser(session.user);
        setUser(authUser);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const authUser = await buildAuthUser(data.user);
      setUser(authUser);
      return { success: true, redirectPath: getRoleDashboardPath(authUser.role) };
    }

    return { success: false, error: 'Login failed' };
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, role: UserRole = 'user') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
