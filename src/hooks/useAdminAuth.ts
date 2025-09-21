import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  username: string;
  role: string;
}

export const useAdminAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkAuth = async () => {
    console.log('=== ADMIN AUTH CHECK ===');
    
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    
    console.log('Stored data:', { hasToken: !!token, hasUser: !!userStr });
    
    if (!token || !userStr) {
      console.log('No stored session, redirecting to login');
      navigate('/admin1244');
      return;
    }

    try {
      console.log('Verifying token with server...');
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { action: 'verify', token }
      });
      
      console.log('Verification response:', { data, error });
      
      if (error) {
        console.error('Verification request failed:', error);
        throw new Error('Verification request failed');
      }
      
      if (!data?.success) {
        console.error('Token verification failed:', data);
        throw new Error('Invalid session');
      }

      console.log('Auth verification successful');
      const userData = JSON.parse(userStr);
      
      // Fetch the user's role from the database
      try {
        const { data: roleData, error: roleError } = await supabase.functions.invoke('admin-management', {
          body: { action: 'get_current_user_role', token }
        });
        
        if (roleError) {
          console.error('Error fetching user role:', roleError);
        } else if (roleData?.role) {
          userData.role = roleData.role;
        }
      } catch (roleErr) {
        console.warn('Failed to fetch user role:', roleErr);
      }
      
      setAdminUser(userData);
      
    } catch (error) {
      console.error('Auth check failed:', error);
      
      // Clear invalid session
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      toast({
        title: "Sitzung abgelaufen",
        description: "Bitte melden Sie sich erneut an.",
        variant: "destructive"
      });
      
      navigate('/admin1244');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('=== LOGOUT PROCESS STARTED ===');
    
    try {
      const token = localStorage.getItem('adminToken');
      
      // Try to logout on server, but don't block if it fails
      if (token) {
        try {
          console.log('Attempting server logout...');
          await supabase.functions.invoke('admin-auth', {
            body: { action: 'logout', token }
          });
          console.log('Server logout successful');
        } catch (error) {
          console.error('Server logout failed (continuing anyway):', error);
        }
      }
      
      // Always clear local storage regardless of server response
      console.log('Clearing local storage...');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Show success message
      toast({
        title: "Abgemeldet",
        description: "Sie wurden erfolgreich abgemeldet.",
      });
      
      console.log('Redirecting to login...');
      navigate('/admin1244');
      
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      
      // Even if something goes wrong, still try to clear and redirect
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      toast({
        title: "Abgemeldet", 
        description: "Abmeldung abgeschlossen (mit Fehlern).",
        variant: "destructive"
      });
      
      navigate('/admin1244');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isLoading,
    adminUser,
    logout,
    checkAuth
  };
};