import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAPI } from '@/hooks/useAdminAPI';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Trash2, Download, Eye } from 'lucide-react';
import { DOCUMENT_TYPES } from '@/config/adminConfig';

interface Lead {
  id: string;
  user_id?: string | null;
  isRegistered?: boolean;
}

interface UserDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  content_type?: string;
}

interface LeadDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_by: string;
  created_at: string;
  content_type?: string;
}

interface LeadDocumentsSectionProps {
  lead: Lead;
  onDocumentsUpdated: () => void;
}

const LeadDocumentsSection: React.FC<LeadDocumentsSectionProps> = ({
  lead,
  onDocumentsUpdated
}) => {
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [leadDocuments, setLeadDocuments] = useState<LeadDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [viewDocument, setViewDocument] = useState<UserDocument | LeadDocument | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  
  const { getUserDocuments, getLeadDocuments, uploadLeadDocument, deleteLeadDocument } = useAdminAPI();
  const { toast } = useToast();

  const fetchDocuments = async () => {
    setLoadingDocuments(true);
    try {
      // Fetch user documents if lead is registered
      if (lead.isRegistered && lead.user_id) {
        const userData = await getUserDocuments(lead.user_id);
        setUserDocuments(userData.documents || []);
      }

      // Fetch admin-uploaded lead documents
      const leadData = await getLeadDocuments(lead.id);
      setLeadDocuments(leadData.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    if (lead) {
      fetchDocuments();
    }
  }, [lead]);

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedDocumentType) {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie eine Datei und einen Dokumenttyp aus.',
        variant: 'destructive'
      });
      return;
    }

    setUploadingDocument(true);
    try {
      await uploadLeadDocument(lead.id, selectedFile, selectedDocumentType);
      
      toast({
        title: 'Erfolgreich',
        description: 'Dokument wurde hochgeladen.'
      });

      setSelectedFile(null);
      setSelectedDocumentType('');
      fetchDocuments();
      onDocumentsUpdated();
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Dokument löschen möchten?')) {
      return;
    }

    try {
      await deleteLeadDocument(documentId);
      
      toast({
        title: 'Erfolgreich',
        description: 'Dokument wurde gelöscht.'
      });

      fetchDocuments();
      onDocumentsUpdated();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleViewDocument = async (doc: UserDocument | LeadDocument, isUserDocument: boolean = false) => {
    try {
      setViewDocument(doc);
      
      const token = localStorage.getItem('adminToken');
      const action = isUserDocument ? 'get_user_document_download_url' : 'get_document_download_url';
      
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action,
          token,
          filePath: doc.file_path
        }
      });

      if (error) throw error;
      setDocumentUrl(data.url);
    } catch (error) {
      console.error('View document error:', error);
      toast({
        title: 'Fehler',
        description: 'Dokument konnte nicht geladen werden.',
        variant: 'destructive'
      });
    }
  };

  const downloadDocument = async (filePath: string, fileName: string, isUserDocument: boolean = false) => {
    try {
      const token = localStorage.getItem('adminToken');
      const action = isUserDocument ? 'get_user_document_download_url' : 'get_document_download_url';
      
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action,
          token,
          filePath: filePath
        }
      });

      if (error) throw error;

      // Create download link
      const link = document.createElement('a');
      link.href = data.url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Download gestartet',
        description: `${fileName} wird heruntergeladen.`
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Fehler',
        description: 'Dokument konnte nicht heruntergeladen werden.',
        variant: 'destructive'
      });
    }
  };

  if (loadingDocuments) {
    return <div className="text-center py-4">Dokumente werden geladen...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <h4 className="font-medium">Neues Dokument hochladen</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Dokumenttyp wählen" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleFileUpload}
            disabled={!selectedFile || !selectedDocumentType || uploadingDocument}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploadingDocument ? 'Wird hochgeladen...' : 'Hochladen'}
          </Button>
        </div>
      </div>

      {/* User Documents (if registered) */}
      {lead.isRegistered && userDocuments.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">
            Vom Benutzer hochgeladene Dokumente
          </h4>
          <div className="space-y-2">
            {userDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{doc.file_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {doc.document_type} • {new Date(doc.uploaded_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDocument(doc, true)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadDocument(doc.file_path, doc.file_name, true)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Documents */}
      {leadDocuments.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">
            Admin-Dokumente
          </h4>
          <div className="space-y-2">
            {leadDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{doc.file_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {doc.document_type} • {new Date(doc.created_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDocument(doc, false)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadDocument(doc.file_path, doc.file_name, false)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!lead.isRegistered && leadDocuments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Keine Dokumente vorhanden</p>
          <p className="text-sm">Laden Sie Dokumente für diesen Lead hoch</p>
        </div>
      )}

      {/* Document Viewer Modal */}
      <Dialog open={!!viewDocument} onOpenChange={() => {
        setViewDocument(null);
        setDocumentUrl(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {viewDocument?.file_name}
            </DialogTitle>
          </DialogHeader>
          
          {documentUrl && viewDocument && (
            <div className="flex-1 min-h-[600px]">
              {viewDocument.content_type === 'application/pdf' ? (
                <iframe
                  src={documentUrl}
                  className="w-full h-[600px] border rounded"
                  title={viewDocument.file_name}
                />
              ) : (
                <img
                  src={documentUrl}
                  alt={viewDocument.file_name}
                  className="max-w-full max-h-[600px] mx-auto object-contain"
                />
              )}
              
              <div className="flex justify-center gap-2 mt-4">
                <Button asChild>
                  <a href={documentUrl} download={viewDocument.file_name} className="gap-2">
                    <Download className="h-4 w-4" />
                    Herunterladen
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadDocumentsSection;