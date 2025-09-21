import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Mail, Shield, User, Eye, EyeOff } from 'lucide-react';
import { useAdminAPI } from '@/hooks/useAdminAPI';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'employee';
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

interface InviteFormData {
  email: string;
  role: 'admin' | 'employee';
}

const EmployeesManagement = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [inviteForm, setInviteForm] = useState<InviteFormData>({
    email: '',
    role: 'employee'
  });
  const { isLoading } = useAdminAPI();
  const { toast } = useToast();

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { 
          action: 'get_admin_users',
          token: localStorage.getItem('adminToken')
        }
      });

      if (error) throw error;

      setAdminUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: 'Fehler',
        description: 'Admin-Benutzer konnten nicht geladen werden.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-invite', {
        body: {
          email: inviteForm.email,
          role: inviteForm.role,
          token: localStorage.getItem('adminToken')
        }
      });

      if (error) throw error;

      toast({
        title: 'Einladung gesendet',
        description: `Einladungs-E-Mail wurde an ${inviteForm.email} gesendet.`,
      });

      setInviteDialogOpen(false);
      setInviteForm({ email: '', role: 'employee' });
      fetchAdminUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: 'Fehler',
        description: 'Einladung konnte nicht gesendet werden.',
        variant: 'destructive'
      });
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'toggle_admin_status',
          user_id: user.id,
          is_active: !user.is_active,
          token: localStorage.getItem('adminToken')
        }
      });

      if (error) throw error;

      toast({
        title: 'Status aktualisiert',
        description: `Benutzer wurde ${!user.is_active ? 'aktiviert' : 'deaktiviert'}.`,
      });

      fetchAdminUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Fehler',
        description: 'Status konnte nicht geändert werden.',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateRole = async (user: AdminUser, newRole: 'admin' | 'employee') => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'update_admin_role',
          user_id: user.id,
          role: newRole,
          token: localStorage.getItem('adminToken')
        }
      });

      if (error) throw error;

      toast({
        title: 'Rolle aktualisiert',
        description: `Benutzerrolle wurde auf ${newRole === 'admin' ? 'Administrator' : 'Mitarbeiter'} geändert.`,
      });

      setEditDialogOpen(false);
      fetchAdminUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Fehler',
        description: 'Rolle konnte nicht geändert werden.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'delete_admin_user',
          user_id: user.id,
          token: localStorage.getItem('adminToken')
        }
      });

      if (error) throw error;

      toast({
        title: 'Benutzer gelöscht',
        description: 'Admin-Benutzer wurde erfolgreich gelöscht.',
      });

      fetchAdminUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Fehler',
        description: 'Benutzer konnte nicht gelöscht werden.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mitarbeiter & Administratoren</h1>
          <p className="text-muted-foreground mt-2">
            Verwalten Sie Admin-Benutzer und Mitarbeiter
          </p>
        </div>
        
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Einladen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Benutzer einladen</DialogTitle>
              <DialogDescription>
                Senden Sie eine Einladung an eine E-Mail-Adresse mit automatisch generierten Zugangsdaten.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="benutzer@beispiel.de"
                />
              </div>
              <div>
                <Label htmlFor="role">Rolle</Label>
                <Select value={inviteForm.role} onValueChange={(value: 'admin' | 'employee') => 
                  setInviteForm(prev => ({ ...prev, role: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Mitarbeiter</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {inviteForm.role === 'employee' 
                    ? 'Kann alles außer Leads und Mitglieder löschen'
                    : 'Vollzugriff auf alle Funktionen'
                  }
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleInviteUser} disabled={!inviteForm.email || isLoading}>
                <Mail className="h-4 w-4 mr-2" />
                Einladung senden
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin-Benutzer</CardTitle>
          <CardDescription>
            {adminUsers.length} Benutzer insgesamt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Benutzername</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Letzter Login</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email || 'Nicht verfügbar'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Administrator
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          Mitarbeiter
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'destructive'}>
                      {user.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString('de-DE')
                      : 'Nie'
                    }
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Dialog open={editDialogOpen && selectedUser?.id === user.id} 
                        onOpenChange={(open) => {
                          setEditDialogOpen(open);
                          if (open) setSelectedUser(user);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Benutzer bearbeiten</DialogTitle>
                            <DialogDescription>
                              Rolle von {user.username} ändern
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Aktuelle Rolle: {user.role === 'admin' ? 'Administrator' : 'Mitarbeiter'}</Label>
                              <Select 
                                defaultValue={user.role} 
                                onValueChange={(value: 'admin' | 'employee') => 
                                  handleUpdateRole(user, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="employee">Mitarbeiter</SelectItem>
                                  <SelectItem value="admin">Administrator</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Benutzer löschen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sind Sie sicher, dass Sie {user.username} löschen möchten? 
                              Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user)}>
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeesManagement;