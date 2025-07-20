import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from '@supabase/supabase-js';

export const signUp = async (email: string, password: string, userData: Record<string, any> = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: userData.first_name || null,
          last_name: userData.last_name || null
        }
      }
    });

    if (error) {
      console.error("Signup error:", error);
      throw error;
    }

    return { user: data.user };
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  console.log(`Attempting to sign in with email: ${email}`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Login error:", error);
      throw error;
    }

    return { user: data.user };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export const getCurrentUser = (): SupabaseUser | null => {
  // This will be handled by the auth state change listener
  return null;
};

export const setCurrentUser = (user: SupabaseUser | null) => {
  // Not needed anymore - Supabase handles this
};

export const isUserAdmin = async (user: SupabaseUser | null): Promise<boolean> => {
  if (!user || !user.email) return false;
  
  console.log("Checking admin status for user:", user.email);
  
  try {
    // Check if user is in admins table
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('email', user.email)
      .single();
    
    if (adminData) {
      console.log("Admin check result: true");
      return true;
    }
    
    console.log("Admin check result: false");
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export const resetPassword = async (email: string) => {
  throw new Error("Password reset not implemented yet");
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/'
    }
  });
  if (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
  return data;
};

export const signInWithGithub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin + '/'
    }
  });
  if (error) {
    console.error('GitHub sign-in error:', error);
    throw error;
  }
  return data;
};