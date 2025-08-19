import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  Eye, 
  Trash2, 
  Download,
  Check,
  X,
  Loader2
} from 'lucide-react';

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  content_type: string;
  created_at: string;
}

interface DocumentUploadSectionProps {
  contactRequestId: string;
  documents: Document[];
  onDocumentsUpdate: () => void;
}

const DOCUMENT_TYPES = [
  {
    id: 'personalausweis',
    label: 'Personalausweis',
    description: 'PDF, JPG oder PNG',
    icon: FileText
  },
  {
    id: 'einkommensnachweis',
    label: 'Einkommensnachweis',
    description: 'PDF oder JPG',
    icon: FileText
  },
  {
    id: 'schufa',
    label: 'SCHUFA-Auskunft',
    description: 'PDF',
    icon: FileText
  }
];

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  contactRequestId,
  documents,
  onDocumentsUpdate
}) => {
  const [uploading, setUploading] = useState<string | null>(null);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { toast } = useToast();

  const handleFileSelect = async (documentType: string, file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Ungültiger Dateityp',
        description: 'Nur PDF, JPG und PNG Dateien sind erlaubt.',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Datei zu groß',
        description: 'Die Datei darf maximal 10MB groß sein.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(documentType);

    try {
      // Convert file to base64 safely
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert in chunks to avoid call stack overflow
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64 = btoa(binary);

      const token = localStorage.getItem('adminToken');
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'upload_lead_document',
          token,
          contactRequestId,
          documentType,
          fileName: file.name,
          fileData: base64,
          contentType: file.type
        }
      });

      if (error) throw error;

      toast({
        title: 'Upload erfolgreich',
        description: `${file.name} wurde hochgeladen.`
      });

      onDocumentsUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload fehlgeschlagen',
        description: 'Die Datei konnte nicht hochgeladen werden.',
        variant: 'destructive'
      });
    } finally {
      setUploading(null);
      // Reset file input
      if (fileInputRefs.current[documentType]) {
        fileInputRefs.current[documentType]!.value = '';
      }
    }
  };

  const handleViewDocument = async (doc: Document) => {
    try {
      setViewDocument(doc);
      
      const token = localStorage.getItem('adminToken');
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'get_document_download_url',
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

  const handleDeleteDocument = async (doc: Document) => {
    if (!confirm(`Möchten Sie "${doc.file_name}" wirklich löschen?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const { error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'delete_lead_document',
          token,
          documentId: doc.id,
          filePath: doc.file_path
        }
      });

      if (error) throw error;

      toast({
        title: 'Dokument gelöscht',
        description: `${doc.file_name} wurde gelöscht.`
      });

      onDocumentsUpdate();
    } catch (error) {
      console.error('Delete document error:', error);
      toast({
        title: 'Löschfehler',
        description: 'Dokument konnte nicht gelöscht werden.',
        variant: 'destructive'
      });
    }
  };

  const getDocumentsForType = (type: string) => {
    return documents.filter(doc => doc.document_type === type);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Dokumente hochladen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DOCUMENT_TYPES.map((docType) => {
            const typeDocuments = getDocumentsForType(docType.id);
            const isUploading = uploading === docType.id;

            return (
              <div key={docType.id} className="space-y-3">
                <div
                  className="border-2 border-dashed border-muted rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => fileInputRefs.current[docType.id]?.click()}
                >
                  <input
                    type="file"
                    ref={el => fileInputRefs.current[docType.id] = el}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(docType.id, file);
                    }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 mx-auto mb-2 text-primary animate-spin" />
                  ) : (
                    <docType.icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  )}
                  
                  <p className="text-sm font-medium">{docType.label}</p>
                  <p className="text-xs text-muted-foreground">{docType.description}</p>
                  
                  {isUploading && (
                    <p className="text-xs text-primary mt-1">Wird hochgeladen...</p>
                  )}
                </div>

                {/* Uploaded documents for this type */}
                {typeDocuments.length > 0 && (
                  <div className="space-y-2">
                    {typeDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.file_name}</p>
                          <p className="text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleViewDocument(doc)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleDeleteDocument(doc)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Document status summary */}
        <div className="mt-6 flex flex-wrap gap-2">
          {DOCUMENT_TYPES.map((docType) => {
            const typeDocuments = getDocumentsForType(docType.id);
            const hasDocuments = typeDocuments.length > 0;

            return (
              <Badge
                key={docType.id}
                variant={hasDocuments ? "default" : "secondary"}
                className={hasDocuments ? "bg-green-100 text-green-800" : ""}
              >
                {hasDocuments ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                {docType.label}
              </Badge>
            );
          })}
        </div>
      </CardContent>

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
    </Card>
  );
};

export default DocumentUploadSection;