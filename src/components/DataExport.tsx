import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileDown, Loader2, Archive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const { toast } = useToast();

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      console.log('Starting export...');
      
      const { data, error } = await supabase.functions.invoke('export-data', {
        method: 'POST'
      });

      if (error) {
        console.error('Export error:', error);
        throw error;
      }

      console.log('Export response:', data);

      if (data?.contact_requests?.csv) {
        downloadCSV(
          data.contact_requests.csv, 
          `contact_requests_${new Date().toISOString().split('T')[0]}.csv`
        );
      }

      if (data?.property_applications?.csv) {
        downloadCSV(
          data.property_applications.csv, 
          `property_applications_${new Date().toISOString().split('T')[0]}.csv`
        );
      }

      toast({
        title: 'Export erfolgreich',
        description: `${data.contact_requests.count} Kontaktanfragen und ${data.property_applications.count} Bewerbungen exportiert`,
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export fehlgeschlagen',
        description: 'Fehler beim Exportieren der Daten',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFullBackup = async () => {
    setIsBackingUp(true);
    
    try {
      console.log('Starting full backup with documents...');
      
      const response = await fetch(`https://msujaimgdxhxmtlaabvn.supabase.co/functions/v1/full-backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the ZIP file as blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `elbtal_full_backup_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Vollständiges Backup erstellt',
        description: 'Alle Daten und Dokumente wurden erfolgreich heruntergeladen',
      });

    } catch (error) {
      console.error('Full backup failed:', error);
      toast({
        title: 'Backup fehlgeschlagen',
        description: 'Fehler beim Erstellen des vollständigen Backups',
        variant: 'destructive'
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Datenexport
        </CardTitle>
        <CardDescription>
          Exportiere alle Kontaktanfragen und Bewerbungen als CSV-Dateien
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleExport} 
          disabled={isExporting || isBackingUp}
          variant="outline"
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exportiere CSV...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Nur CSV Dateien
            </>
          )}
        </Button>

        <Button 
          onClick={handleFullBackup} 
          disabled={isExporting || isBackingUp}
          className="w-full"
        >
          {isBackingUp ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Erstelle Vollbackup...
            </>
          ) : (
            <>
              <Archive className="h-4 w-4 mr-2" />
              Vollständiges Backup (inkl. 128 Dokumente)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataExport;