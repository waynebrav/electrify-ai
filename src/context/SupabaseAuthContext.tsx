
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  setCurrentUser, 
  isUserAdmin
} from "@/services/supabase-auth-service";

interface AuthContextType {
  user: SupabaseUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isFirstLogin: boolean;
  profile: any | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData?: Record<string, any>) => Promise<any>;
  signOut: () => Promise<void>;
  checkIsAdmin: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  setIsFirstLogin: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    // Check for existing user session
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      checkIsAdmin();
      fetchProfile(currentUser.id);
    }
    setIsLoading(false);
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
    if (result.user) {
      setUser(result.user);
      setCurrentUser(result.user);
      await checkIsAdmin();
      await fetchProfile(result.user.id);
    }
    return result;
  };

  const handleSignUp = async (email: string, password: string, userData?: Record<string, any>) => {
    const result = await signUp(email, password, userData);
    if (result.user) {
      setUser(result.user);
      setCurrentUser(result.user);
      setIsFirstLogin(true);
      await fetchProfile(result.user.id);
    }
    return result;
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    setIsFirstLogin(false);
  };

  const value = {
    user,
    isLoading,
    isAdmin,
    isFirstLogin,
    profile,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    checkIsAdmin,
    refreshProfile,
    setIsFirstLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider");
  }
  return context;
};
