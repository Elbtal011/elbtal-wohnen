import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import PropertiesManagement from '@/components/PropertiesManagement';
import ContactRequestsManagement from '@/components/ContactRequestsManagement';
import CitiesManagement from '@/components/CitiesManagement';
import MembersManagement from '@/components/MembersManagement';
import EmployeesManagement from '@/components/EmployeesManagement';
import AdminOverview from '@/components/AdminOverview';
import AnalyticsReporting from '@/components/AnalyticsReporting';
import BackupManagement from '@/components/BackupManagement';
import LeadsManagement from '@/components/LeadsManagement';
import PostIdent1Management from '@/components/PostIdent1Management';
import PostIdent2Management from '@/components/PostIdent2Management';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [backupData, setBackupData] = useState({
    backups: [],
    isLoading: true,
    downloadProgress: {}
  });
  const { isLoading, adminUser, logout } = useAdminAuth();


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
      case 'employees':
        return <EmployeesManagement />;
      case 'members':
        return <MembersManagement adminUser={adminUser} />;
      case 'leads':
        return <LeadsManagement adminUser={adminUser} />;
      case 'postident1':
        return <PostIdent1Management adminUser={adminUser} />;
      case 'postident2':
        return <PostIdent2Management adminUser={adminUser} />;
      case 'cities':
        return <CitiesManagement />;
      case 'analytics':
        return <AnalyticsReporting />;
      case 'backup':
        return <BackupManagement 
          backupData={backupData} 
          setBackupData={setBackupData} 
        />;
      default:
        return <AdminOverview onTabChange={setActiveTab} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} adminUser={adminUser} onLogout={logout} />
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