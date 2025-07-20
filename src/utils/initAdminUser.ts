
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_EMAIL } from "@/lib/constants";

export const initAdminUser = async () => {
  try {
    // First check if we can sign in with these credentials
    // If we can, then the user already exists and we don't need to create it
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: "167813377Bs#"
    });
    
    if (!signInError && signInData.user) {
      console.log("Admin user already exists and credentials are valid");
      
      // Make sure the user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', signInData.user.id)
        .eq('role', 'admin');
        
      if (roleError) {
        console.error("Error checking admin role:", roleError);
      }
      
      // If no admin role, add it
      if (!roleData || roleData.length === 0) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: signInData.user.id,
            role: 'admin'
          });
          
        if (insertError) {
          console.error("Error adding admin role:", insertError);
        } else {
          console.log("Added admin role to existing user");
        }
      }
      
      await supabase.auth.signOut();
      return true;
    }
    
    // If sign in failed, either user doesn't exist or password is wrong
    // Try to create the user using the edge function
    console.log("Creating admin user via edge function...");
    const response = await fetch(
      "https://yhlxoypsnlraplpifrfg.supabase.co/functions/v1/create-admin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: "167813377Bs#", // Using the specified admin password
        }),
      }
    );

    const result = await response.json();
    console.log("Admin user initialization result:", result);
    
    if (result.success) {
      console.log("Admin user created successfully");
      return true;
    } else {
      console.error("Failed to create admin user:", result.error);
      return false;
    }
  } catch (error) {
    console.error("Error initializing admin user:", error);
    return false;
  }
};
