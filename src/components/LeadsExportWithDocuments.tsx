import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Archive, Download, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LeadsExportWithDocuments = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleExportWithDocuments = async () => {
    setIsExporting(true);
    
    try {
      console.log('Starting export with documents...');

      // Call the full-backup function which now includes lead documents
      const response = await fetch(`https://msujaimgdxhxmtlaabvn.supabase.co/functions/v1/full-backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
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
      link.download = `leads_with_documents_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export erfolgreich',
        description: 'Leads und Dokumente wurden als ZIP-Datei heruntergeladen',
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export fehlgeschlagen',
        description: 'Fehler beim Exportieren der Leads mit Dokumenten',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportWithDocuments = async () => {
    if (!importFile) {
      toast({
        title: 'Keine Datei ausgewählt',
        description: 'Bitte wählen Sie eine ZIP-Datei zum Importieren aus',
        variant: 'destructive'
      });
      return;
    }

    setIsImporting(true);
    
    try {
      console.log('Starting import with documents...');
      
      const formData = new FormData();
      formData.append('zipFile', importFile);

      const response = await fetch(`https://msujaimgdxhxmtlaabvn.supabase.co/functions/v1/leads-import-with-documents`, {
        method: 'POST',
        body: formData
      });

      let result: any = null;
      if (!response.ok) {
        try {
          const errJson = await response.json();
          throw new Error(errJson?.error || errJson?.message || `HTTP ${response.status}`);
        } catch {
          throw new Error(`HTTP ${response.status}`);
        }
      }

      result = await response.json();

      if (result.success) {
        toast({
          title: 'Import erfolgreich',
          description: result.message,
        });
        setImportFile(null);
        const fileInput = document.getElementById('import-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(result.error || result.message || 'Import failed');
      }

    } catch (error: any) {
      console.error('Import failed:', error);
      toast({
        title: 'Import fehlgeschlagen',
        description: error?.message || 'Fehler beim Importieren der Leads mit Dokumenten',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="hover-scale">
          <Archive className="h-4 w-4 mr-2" />
          Export/Import mit Dokumenten
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Leads mit Dokumenten Export/Import</DialogTitle>
          <DialogDescription>
            Exportiere oder importiere Leads zusammen mit ihren Dokumenten
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Leads mit Dokumenten exportieren
              </CardTitle>
              <CardDescription>
                Exportiert alle Leads und deren zugehörige Dokumente als ZIP-Datei
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Exportiert immer sämtliche aktuellen Leads und deren Dokumente.
              </p>
              
              <Button 
                onClick={handleExportWithDocuments} 
                disabled={isExporting || isImporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exportiere Leads mit Dokumenten...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Leads mit Dokumenten exportieren
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Leads mit Dokumenten importieren
              </CardTitle>
              <CardDescription>
                Importiert Leads und Dokumente aus einer zuvor exportierten ZIP-Datei
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-file">
                  ZIP-Datei auswählen
                </Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".zip"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-muted-foreground">
                  Wählen Sie eine ZIP-Datei aus, die zuvor mit dem Export-Tool erstellt wurde.
                </p>
              </div>
              
              <Button 
                onClick={handleImportWithDocuments} 
                disabled={isExporting || isImporting || !importFile}
                variant="outline"
                className="w-full"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importiere Leads mit Dokumenten...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Leads mit Dokumenten importieren
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadsExportWithDocuments;