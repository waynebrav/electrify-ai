import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isAdmin } from '@/services/admin-auth-service';

interface SecureAuthHook {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const useSecureAuth = (): SecureAuthHook => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            setIsAuthenticated(true);
            
            // Check admin status securely
            const adminStatus = await isAdmin(session.user.email || '');
            setIsAdminUser(adminStatus);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setIsAdminUser(false);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdminUser(false);
          setLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            setIsAuthenticated(true);
            
            const adminStatus = await isAdmin(session.user.email || '');
            setIsAdminUser(adminStatus);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setIsAdminUser(false);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setIsAdminUser(false);
  };

  return {
    isAuthenticated,
    isAdmin: isAdminUser,
    user,
    loading,
    signOut
  };
};