import React, { useState } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Building2, 
  MessageSquare, 
  Tag,
  MapPin,
  BarChart3,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  adminUser: any;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange, adminUser, onLogout }) => {
  const { setOpenMobile, isMobile } = useSidebar();
  const [leadsExpanded, setLeadsExpanded] = useState(
    activeTab === 'leads' || activeTab === 'postident1' || activeTab === 'postident2'
  );

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    // Keep dropdown expanded when navigating between leads sections
    if (tab === 'leads' || tab === 'postident1' || tab === 'postident2') {
      setLeadsExpanded(true);
    }
    // Close sidebar on mobile when item is clicked
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLeadsClick = () => {
    if (activeTab === 'postident1' || activeTab === 'postident2') {
      // If in a PostIdent section, go back to main leads
      handleTabChange('leads');
      setLeadsExpanded(true);
    } else if (activeTab === 'leads') {
      // If already in main leads, toggle dropdown
      setLeadsExpanded(!leadsExpanded);
    } else {
      // If in other section, go to leads and expand dropdown
      setLeadsExpanded(true);
      handleTabChange('leads');
    }
  };

  const menuItems = [
    {
      id: 'overview',
      label: 'Übersicht',
      icon: LayoutDashboard,
    },
    {
      id: 'properties',
      label: 'Immobilien',
      icon: Building2,
    },
    {
      id: 'contacts',
      label: 'Anfragen',
      icon: MessageSquare,
    },
    {
      id: 'cities',
      label: 'Städte',
      icon: MapPin,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
  ];

  const leadsSubItems = [
    {
      id: 'postident1',
      label: 'PostIdent 1',
      icon: CheckCircle,
    },
    {
      id: 'postident2',
      label: 'PostIdent 2',
      icon: UserCheck,
    },
  ];

  return (
    <Sidebar className="w-64 border-r" collapsible="offcanvas">
      <SidebarContent className="flex flex-col h-full">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-primary mb-2">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">Verwaltungsbereich</p>
        </div>
        
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-lg transition-all duration-200 font-medium ${
                      activeTab === item.id 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'hover:bg-muted hover:shadow-sm'
                    }`}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-sm">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Leads with dropdown */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLeadsClick}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-lg transition-all duration-200 font-medium ${
                    activeTab === 'leads' || activeTab === 'postident1' || activeTab === 'postident2'
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'hover:bg-muted hover:shadow-sm'
                  }`}
                >
                  <Tag className="h-6 w-6" />
                  <span className="text-sm flex-1">Leads</span>
                  {leadsExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </SidebarMenuButton>
                
                {leadsExpanded && (
                  <div className="ml-6 mt-2 space-y-1">
                    {leadsSubItems.map((subItem) => (
                      <SidebarMenuButton
                        key={subItem.id}
                        onClick={() => handleTabChange(subItem.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
                          activeTab === subItem.id 
                            ? 'bg-primary/80 text-primary-foreground shadow-sm' 
                            : 'hover:bg-muted/60'
                        }`}
                      >
                        <subItem.icon className="h-4 w-4" />
                        <span>{subItem.label}</span>
                      </SidebarMenuButton>
                    ))}
                  </div>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="p-4 border-t">
          <SidebarMenuButton
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-medium truncate">{adminUser?.username || 'Admin'}</span>
              <span className="text-xs text-muted-foreground">Administrator</span>
            </div>
            <LogOut className="h-4 w-4" />
          </SidebarMenuButton>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;