import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Trash2, Plus, RefreshCw, Database, HardDrive } from 'lucide-react';
import { format } from 'date-fns';

interface BackupRecord {
  id: string;
  created_at: string;
  backup_date: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  backup_type: string;
  status: string;
  includes_database: boolean;
  includes_storage: boolean;
  metadata: any;
}

const BackupManagement: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('backup-system', {
        body: { action: 'list_backups' }
      });

      if (error) throw error;

      setBackups(data.backups || []);
    } catch (error) {
      console.error('Error loading backups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load backups',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const { data, error } = await supabase.functions.invoke('backup-system', {
        body: { action: 'create_backup' }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Backup created successfully',
        });
        await loadBackups();
      } else {
        throw new Error(data.error || 'Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Error',
        description: 'Failed to create backup',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const downloadBackup = async (backupId: string, fileName: string) => {
    setDownloadingIds(prev => new Set([...prev, backupId]));
    
    try {
      const { data, error } = await supabase.functions.invoke('backup-system', {
        body: { action: 'download_backup', backup_id: backupId }
      });

      if (error) throw error;

      if (data.download_url) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'Success',
          description: 'Backup download started',
        });
      } else {
        throw new Error('No download URL received');
      }
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast({
        title: 'Error',
        description: 'Failed to download backup',
        variant: 'destructive',
      });
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(backupId);
        return newSet;
      });
    }
  };

  const deleteBackup = async (backupId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('backup-system', {
        body: { action: 'delete_backup', backup_id: backupId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Backup deleted successfully',
        });
        await loadBackups();
      } else {
        throw new Error(data.error || 'Failed to delete backup');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete backup',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'destructive';
      case 'in_progress': return 'warning';
      default: return 'secondary';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'daily': return 'info';
      case 'manual': return 'orange';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Backup Management</h1>
          <p className="text-muted-foreground">
            Create, download, and manage system backups. Only the 10 most recent backups are retained.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadBackups}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={createBackup}
            disabled={isCreatingBackup}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCreatingBackup ? 'Creating...' : 'Create Backup'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.length}</div>
            <p className="text-xs text-muted-foreground">
              Maximum 10 retained
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(backups.reduce((sum, backup) => sum + (backup.file_size || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Total backup size
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Backup</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backups.length > 0 ? format(new Date(backups[0].created_at), 'MMM dd') : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent backup
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>
            View and manage your backup files. Each backup contains complete database export and storage file information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No backups available</p>
              <p className="text-muted-foreground">Create your first backup to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Includes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell className="font-medium">
                      {backup.file_name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(backup.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(backup.backup_type)}>
                        {backup.backup_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(backup.status)}>
                        {backup.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatFileSize(backup.file_size)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {backup.includes_database && (
                          <Badge variant="outline" className="text-xs">DB</Badge>
                        )}
                        {backup.includes_storage && (
                          <Badge variant="outline" className="text-xs">Files</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadBackup(backup.id, backup.file_name)}
                          disabled={downloadingIds.has(backup.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Backup</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this backup? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteBackup(backup.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManagement;