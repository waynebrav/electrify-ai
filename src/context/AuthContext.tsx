
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import {
  signIn,
  signUp,
  signOut,
  isUserAdmin,
  signInWithGoogle as supabaseSignInWithGoogle,
  signInWithGithub as supabaseSignInWithGithub
} from "@/services/supabase-auth-service";

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isFirstLogin: boolean;
  profile: any | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData?: Record<string, any>) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  signInWithGithub: () => Promise<any>;
  checkIsAdmin: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  setIsFirstLogin: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkIsAdmin();
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkIsAdmin();
        fetchProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  };
  
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const checkIsAdmin = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const adminStatus = await isUserAdmin(user);
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      return false;
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    return result;
  };

  const handleSignUp = async (email: string, password: string, userData?: Record<string, any>) => {
    const result = await signUp(email, password, userData);
    if (result.user) {
      setIsFirstLogin(true);
    }
    return result;
  };

  const handleSignOut = async () => {
    await signOut();
    setIsFirstLogin(false);
  };

  const handleSignInWithGoogle = async () => {
    return supabaseSignInWithGoogle();
  };

  const handleSignInWithGithub = async () => {
    return supabaseSignInWithGithub();
  };

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    isFirstLogin,
    profile,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithGithub: handleSignInWithGithub,
    checkIsAdmin,
    refreshProfile,
    setIsFirstLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
