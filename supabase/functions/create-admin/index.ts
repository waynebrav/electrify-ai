
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

serve(async (req) => {
  try {
    // Create a Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { email, password } = await req.json();
    
    // Basic validation
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email and password are required",
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
    });

    if (authError) {
      throw new Error(authError.message);
    }

    // Check if user was created
    if (!authData.user) {
      throw new Error("Failed to create user");
    }

    // Add admin role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role: "admin",
      })
      .select();
      
    if (roleError) {
      throw new Error(`Failed to set admin role: ${roleError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin user created successfully",
        userId: authData.user.id,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create admin user",
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
