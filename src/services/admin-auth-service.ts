
import { supabase } from "@/integrations/supabase/client";

export const signInAdmin = async (email: string, password: string) => {
  console.log(`Attempting admin login with email: ${email}`);
  
  // Query the admins table to check credentials
  const { data, error } = await supabase.rpc('authenticate_admin', {
    admin_email: email,
    admin_password: password
  });

  if (error) {
    console.error("Admin login error:", error);
    throw new Error("Invalid admin credentials");
  }

  if (!data) {
    throw new Error("Invalid admin credentials");
  }

  return data;
};

export const getCurrentAdmin = async (email: string) => {
  const { data, error } = await supabase
    .from('admins')
    .select('id, email, first_name, last_name, phone, gender, date_of_birth')
    .eq('email', email)
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};
