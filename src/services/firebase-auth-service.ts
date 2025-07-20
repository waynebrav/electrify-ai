
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { ADMIN_EMAIL } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export const signUp = async (email: string, password: string, userData: Record<string, any> = {}) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update profile with additional user data if provided
  if (userData.first_name || userData.last_name) {
    const displayName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
    await updateProfile(user, {
      displayName,
    });
  }
  
  // Save additional user data to Supabase
  if (Object.keys(userData).length > 0) {
    await supabase.from('profiles').upsert({
      id: user.uid,
      email: user.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  return { user };
};

export const signIn = async (email: string, password: string) => {
  console.log(`Attempting to sign in with email: ${email}`);
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    
    // Special check for admin user
    if (email === ADMIN_EMAIL) {
      console.log("Admin user detected, checking role...");
      
      // Check if user has admin role in Supabase
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.uid)
        .eq('role', 'admin');
      
      console.log("Admin role check:", { data, error });
      
      // If admin role doesn't exist, add it
      if ((!data || data.length === 0) && !error) {
        const { data: insertData, error: insertError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: user.uid,
            role: 'admin'
          });
          
        console.log("Added admin role:", { insertData, insertError });
      }
    }
    
    console.log("Sign in successful:", user);
    return { user };
  } catch (error) {
    console.error("Sign in failed:", error);
    throw error;
  }
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return { user: result.user };
};

export const signInWithGithub = async () => {
  const result = await signInWithPopup(auth, githubProvider);
  return { user: result.user };
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const isUserAdmin = async (user: FirebaseUser | null): Promise<boolean> => {
  if (!user) return false;
  
  console.log("Checking admin status for user:", user.email);
  
  // Check if the user is the predefined admin email
  if (user.email === ADMIN_EMAIL) {
    console.log("User email matches admin email");
    
    // Check if admin role exists in Supabase
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.uid)
      .eq('role', 'admin');
    
    console.log("Admin role check results:", { data, error });
    
    // If admin role doesn't exist, add it
    if (!data || data.length === 0) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.uid,
          role: 'admin'
        });
        
      if (insertError) {
        console.error("Error adding admin role:", insertError);
        return false;
      }
      
      console.log("Added admin role to user");
    }
    
    return true;
  }
  
  // Check if user has admin role in Supabase
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.uid)
    .eq('role', 'admin');
    
  if (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
  
  console.log("Admin check result:", data && data.length > 0);
  return data && data.length > 0;
};

// Function to ensure admin user exists
export const initFirebaseAdminUser = async () => {
  try {
    // First, try to sign in as admin
    try {
      console.log("Attempting to sign in as admin to check if admin exists...");
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, "167813377Bs#");
      console.log("Admin user exists, signed in successfully");
      
      // Check if admin role exists in Supabase
      const user = auth.currentUser;
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.uid)
          .eq('role', 'admin');
        
        // If admin role doesn't exist, add it
        if (!data || data.length === 0) {
          await supabase
            .from('user_roles')
            .upsert({
              user_id: user.uid,
              role: 'admin'
            });
          console.log("Added admin role to existing user");
        }
        
        await firebaseSignOut(auth);
      }
      
      return true;
    } catch (signInError) {
      console.log("Admin user doesn't exist or credentials are invalid, creating now...");
      console.error(signInError);
      
      // Create admin user if sign in fails
      const { user } = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, "167813377Bs#");
      
      // Add admin role in Supabase
      await supabase
        .from('user_roles')
        .upsert({
          user_id: user.uid,
          role: 'admin'
        });
      
      // Create profile in Supabase
      await supabase
        .from('profiles')
        .upsert({
          id: user.uid,
          email: ADMIN_EMAIL,
          first_name: "Admin",
          last_name: "User",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      console.log("Admin user created successfully with ID:", user.uid);
      await firebaseSignOut(auth);
      return true;
    }
  } catch (error) {
    console.error("Failed to initialize admin user:", error);
    return false;
  }
};

export const resetPassword = async (email: string) => {
  // Import sendPasswordResetEmail only when needed to avoid tree-shaking issues
  const { sendPasswordResetEmail } = await import("firebase/auth");
  await sendPasswordResetEmail(auth, email);
};
