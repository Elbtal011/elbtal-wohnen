import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import PropertiesManagement from '@/components/PropertiesManagement';
import ContactRequestsManagement from '@/components/ContactRequestsManagement';
import CitiesManagement from '@/components/CitiesManagement';
import MembersManagement from '@/components/MembersManagement';
import AdminOverview from '@/components/AdminOverview';
import AnalyticsReporting from '@/components/AnalyticsReporting';
import LeadsManagement from '@/components/LeadsManagement';
import PostIdent1Management from '@/components/PostIdent1Management';
import PostIdent2Management from '@/components/PostIdent2Management';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('=== DASHBOARD AUTH CHECK ===');
      
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
        setAdminUser(JSON.parse(userStr));
        
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

    checkAuth();
  }, [navigate, toast]);

  const handleLogout = async () => {
    console.log('=== LOGOUT PROCESS ===');
    
    const token = localStorage.getItem('adminToken');
    
    // Logout on server
    if (token) {
      try {
        await supabase.functions.invoke('admin-auth', {
          body: { action: 'logout', token }
        });
        console.log('Server logout successful');
      } catch (error) {
        console.error('Server logout failed:', error);
      }
    }
    
    // Clear local storage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet.",
    });
    
    navigate('/admin1244');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview onTabChange={setActiveTab} />;
      case 'properties':
        return <PropertiesManagement />;
      case 'contacts':
        return <ContactRequestsManagement />;
      case 'members':
        return <MembersManagement />;
      case 'leads':
        return <LeadsManagement />;
      case 'postident1':
        return <PostIdent1Management />;
      case 'postident2':
        return <PostIdent2Management />;
      case 'cities':
        return <CitiesManagement />;
      case 'analytics':
        return <AnalyticsReporting />;
      default:
        return <AdminOverview onTabChange={setActiveTab} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} adminUser={adminUser} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="md:hidden p-4 border-b bg-background">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <SidebarTrigger className="p-2 hover:bg-muted rounded-lg" />
            </div>
          </div>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;