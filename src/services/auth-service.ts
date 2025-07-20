
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_EMAIL } from "@/lib/constants";

export const signUp = async (email: string, password: string, userData: Record<string, any> = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    }
  });

  if (error) {
    console.error("Signup error:", error);
    throw error;
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  console.log(`Attempting to sign in with email: ${email}`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error("Login error:", error);
    throw error;
  }

  console.log("Sign in successful:", data);
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    throw error;
  }
  
  return data.user;
};

export const isUserAdmin = async () => {
  const user = await getCurrentUser();
  
  if (!user) return false;
  
  // Check if the user is the predefined admin email
  if (user.email === ADMIN_EMAIL) return true;
  
  // Check if the user has admin role in the database
  const { data, error } = await supabase
    .rpc('is_admin', { user_id: user.id });
    
  if (error) {
    console.error("Error checking admin status:", error);
    throw error;
  }
  
  return data || false;
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) {
    throw error;
  }
};
