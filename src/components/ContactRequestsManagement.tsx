import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Calendar, Building2, Eye, Trash2, ChevronLeft, ChevronRight, Upload, FileText, X, Save } from 'lucide-react';

interface ContactRequest {
  id: string;
  anrede: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  strasse: string;
  nummer: string;
  plz: string;
  ort: string;
  nachricht: string;
  status: 'new' | 'in_progress' | 'completed' | 'archived';
  created_at: string;
  lead_label?: string;
  lead_stage?: string;
  property?: {
    title: string;
    address: string;
  };
}

interface LeadDocument {
  id: string;
  file_name: string;
  file_path: string;
  content_type: string;
  file_size: number;
  document_type: string;
  created_at: string;
}

const ContactRequestsManagement = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [editedRequest, setEditedRequest] = useState<ContactRequest | null>(null);
  const [leadDocuments, setLeadDocuments] = useState<LeadDocument[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const itemsPerPage = 15;

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const { data } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_contact_requests', token }
      });

      if (data?.requests) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Fehler",
        description: "Anfragen konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await supabase.functions.invoke('admin-management', {
        body: { 
          action: 'update_contact_request_status', 
          token, 
          id: requestId, 
          status: newStatus 
        }
      });

      if (data?.request) {
        toast({
          title: "Status aktualisiert",
          description: `Anfrage wurde als "${getStatusLabel(newStatus)}" markiert.`,
        });
        fetchRequests();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  };

  const deleteRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await supabase.functions.invoke('admin-management', {
        body: { 
          action: 'delete_contact_request', 
          token, 
          id: requestId
        }
      });

      if (data?.success) {
        toast({
          title: "Anfrage gelöscht",
          description: "Die Kontaktanfrage wurde erfolgreich gelöscht.",
        });
        fetchRequests();
        setCurrentPage(1); // Reset to first page after deletion
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: "Fehler",
        description: "Anfrage konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Neu';
      case 'in_progress': return 'In Bearbeitung';
      case 'completed': return 'Abgeschlossen';
      case 'archived': return 'Archiviert';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'in_progress': return 'default';
      case 'completed': return 'secondary';
      case 'archived': return 'outline';
      default: return 'outline';
    }
  };

  const handleViewRequest = async (request: ContactRequest) => {
    setSelectedRequest(request);
    setEditedRequest({ ...request });
    setViewDialogOpen(true);
    await fetchLeadDocuments(request.id);
  };

  const fetchLeadDocuments = async (contactRequestId: string) => {
    try {
      const { data, error } = await supabase
        .from('lead_documents')
        .select('*')
        .eq('contact_request_id', contactRequestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeadDocuments(data || []);
    } catch (error) {
      console.error('Error fetching lead documents:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    Array.from(files).forEach(file => {
      if (allowedTypes.includes(file.type)) {
        if (file.size <= 10 * 1024 * 1024) { // 10MB limit
          validFiles.push(file);
        } else {
          toast({
            title: "Datei zu groß",
            description: `${file.name} ist größer als 10MB.`,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Dateityp nicht unterstützt",
          description: `${file.name} ist kein unterstützter Dateityp.`,
          variant: "destructive"
        });
      }
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadDocuments = async () => {
    if (!selectedRequest || selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${selectedRequest.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('lead-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save document metadata
        const { error: dbError } = await supabase
          .from('lead_documents')
          .insert({
            contact_request_id: selectedRequest.id,
            file_name: file.name,
            file_path: fileName,
            content_type: file.type,
            file_size: file.size,
            document_type: getDocumentType(file.type),
            uploaded_by: null // admin upload
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Dokumente hochgeladen",
        description: `${selectedFiles.length} Dokument(e) erfolgreich hochgeladen.`,
      });

      setSelectedFiles([]);
      await fetchLeadDocuments(selectedRequest.id);
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast({
        title: "Fehler beim Hochladen",
        description: "Dokumente konnten nicht hochgeladen werden.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = async (documentId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('lead-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('lead_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast({
        title: "Dokument gelöscht",
        description: "Das Dokument wurde erfolgreich entfernt.",
      });

      if (selectedRequest) {
        await fetchLeadDocuments(selectedRequest.id);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Fehler",
        description: "Dokument konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  };

  const getDocumentType = (contentType: string): string => {
    if (contentType === 'application/pdf') return 'PDF';
    if (contentType.startsWith('image/')) return 'Bild';
    return 'Dokument';
  };

  const saveRequestChanges = async () => {
    if (!editedRequest) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'update_contact_request',
          token,
          id: editedRequest.id,
          updates: editedRequest
        }
      });

      if (data?.success) {
        toast({
          title: "Änderungen gespeichert",
          description: "Die Kontaktanfrage wurde erfolgreich aktualisiert.",
        });
        
        await fetchRequests();
        setSelectedRequest(editedRequest);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Fehler",
        description: "Änderungen konnten nicht gespeichert werden.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(request => request.status === filterStatus);

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Kontaktanfragen</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Anfragen werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Kontaktanfragen</h1>
        <div className="flex items-center gap-4">
          <Select value={filterStatus} onValueChange={(value) => {
            setFilterStatus(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Anfragen</SelectItem>
              <SelectItem value="new">Neue Anfragen</SelectItem>
              <SelectItem value="in_progress">In Bearbeitung</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
              <SelectItem value="archived">Archiviert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {filteredRequests.length} Anfrage{filteredRequests.length !== 1 ? 'n' : ''} 
            {filterStatus !== 'all' && ` (${getStatusLabel(filterStatus)})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentRequests.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Name</TableHead>
                      <TableHead className="min-w-[160px]">Kontakt</TableHead>
                      <TableHead className="min-w-[120px]">Immobilie</TableHead>
                      <TableHead className="min-w-[100px]">Datum</TableHead>
                      <TableHead className="min-w-[140px]">Status</TableHead>
                      <TableHead className="text-right min-w-[100px]">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {currentRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {request.anrede && `${request.anrede === 'herr' ? 'Hr.' : request.anrede === 'frau' ? 'Fr.' : 'Divers'} `}
                            <span className="block sm:inline">{request.vorname} {request.nachname}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{request.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{request.telefon}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.property ? (
                          <div className="flex items-center gap-1 text-xs">
                            <Building2 className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[100px]">
                              {request.property.title}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Allgemein</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="block">
                            {new Date(request.created_at).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={request.status} 
                          onValueChange={(value) => updateStatus(request.id, value)}
                        >
                          <SelectTrigger className="w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Neu</SelectItem>
                            <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                            <SelectItem value="completed">Abgeschlossen</SelectItem>
                            <SelectItem value="archived">Archiviert</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                            className="p-2"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="p-2">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Anfrage löschen</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Sind Sie sicher, dass Sie diese Kontaktanfrage von {request.vorname} {request.nachname} löschen möchten? 
                                  Diese Aktion kann nicht rückgängig gemacht werden.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteRequest(request.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
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
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Zeige {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} von {filteredRequests.length} Anfragen
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Seite {currentPage} von {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {filterStatus === 'all' ? 'Keine Anfragen gefunden' : `Keine ${getStatusLabel(filterStatus).toLowerCase()}en Anfragen`}
              </h3>
              <p className="text-muted-foreground">
                {filterStatus === 'all' 
                  ? 'Noch keine Kontaktanfragen eingegangen.' 
                  : 'Ändern Sie den Filter, um andere Anfragen zu sehen.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Request Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(open) => {
        setViewDialogOpen(open);
        if (!open) {
          setSelectedFiles([]);
          setLeadDocuments([]);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Kontaktanfrage bearbeiten
              <Button
                onClick={saveRequestChanges}
                disabled={isSaving}
                size="sm"
                className="ml-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Speichern...' : 'Speichern'}
              </Button>
            </DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Kontaktanfrage und laden Sie interne Dokumente hoch
            </DialogDescription>
          </DialogHeader>
          
          {editedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Data */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Persönliche Daten</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="anrede">Anrede</Label>
                      <Select 
                        value={editedRequest.anrede} 
                        onValueChange={(value) => setEditedRequest({...editedRequest, anrede: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="herr">Herr</SelectItem>
                          <SelectItem value="frau">Frau</SelectItem>
                          <SelectItem value="divers">Divers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="vorname">Vorname</Label>
                        <Input
                          id="vorname"
                          value={editedRequest.vorname}
                          onChange={(e) => setEditedRequest({...editedRequest, vorname: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="nachname">Nachname</Label>
                        <Input
                          id="nachname"
                          value={editedRequest.nachname}
                          onChange={(e) => setEditedRequest({...editedRequest, nachname: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">E-Mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedRequest.email}
                        onChange={(e) => setEditedRequest({...editedRequest, email: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="telefon">Telefon</Label>
                      <Input
                        id="telefon"
                        value={editedRequest.telefon}
                        onChange={(e) => setEditedRequest({...editedRequest, telefon: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Adresse</h4>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <Label htmlFor="strasse">Straße</Label>
                        <Input
                          id="strasse"
                          value={editedRequest.strasse || ''}
                          onChange={(e) => setEditedRequest({...editedRequest, strasse: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="nummer">Nr.</Label>
                        <Input
                          id="nummer"
                          value={editedRequest.nummer || ''}
                          onChange={(e) => setEditedRequest({...editedRequest, nummer: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="plz">PLZ</Label>
                        <Input
                          id="plz"
                          value={editedRequest.plz || ''}
                          onChange={(e) => setEditedRequest({...editedRequest, plz: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ort">Ort</Label>
                        <Input
                          id="ort"
                          value={editedRequest.ort || ''}
                          onChange={(e) => setEditedRequest({...editedRequest, ort: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status and Labels */}
                  <div className="space-y-3 pt-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={editedRequest.status} 
                        onValueChange={(value) => setEditedRequest({...editedRequest, status: value as any})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Neu</SelectItem>
                          <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                          <SelectItem value="completed">Abgeschlossen</SelectItem>
                          <SelectItem value="archived">Archiviert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="lead_label">Lead Label</Label>
                      <Select 
                        value={editedRequest.lead_label || ''} 
                        onValueChange={(value) => setEditedRequest({...editedRequest, lead_label: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Label auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Kein Label</SelectItem>
                          <SelectItem value="Kalt">Kalt</SelectItem>
                          <SelectItem value="Warm">Warm</SelectItem>
                          <SelectItem value="PI 1 erstellt">PI 1 erstellt</SelectItem>
                          <SelectItem value="PI 2 erstellt">PI 2 erstellt</SelectItem>
                          <SelectItem value="Unterlagen erhalten - PI senden">Unterlagen erhalten - PI senden</SelectItem>
                          <SelectItem value="Besichtigung vereinbaren">Besichtigung vereinbaren</SelectItem>
                          <SelectItem value="Hot Lead">Hot Lead</SelectItem>
                          <SelectItem value="Property Application">Property Application</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="nachricht">Nachricht</Label>
                <Textarea
                  id="nachricht"
                  value={editedRequest.nachricht}
                  onChange={(e) => setEditedRequest({...editedRequest, nachricht: e.target.value})}
                  rows={4}
                />
              </div>

              {/* Property Info (if exists) */}
              {editedRequest.property && (
                <div>
                  <h4 className="font-semibold mb-2">Immobilien-Information</h4>
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <div><strong>Titel:</strong> {editedRequest.property.title}</div>
                    <div><strong>Adresse:</strong> {editedRequest.property.address}</div>
                  </div>
                </div>
              )}

              {/* Document Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Interne Dokumente</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="document-upload"
                    />
                    <Button
                      onClick={() => document.getElementById('document-upload')?.click()}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Dokumente wählen
                    </Button>
                    {selectedFiles.length > 0 && (
                      <Button
                        onClick={uploadDocuments}
                        disabled={isUploading}
                        size="sm"
                      >
                        {isUploading ? 'Hochladen...' : `${selectedFiles.length} hochladen`}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Ausgewählte Dateien:</p>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <FileText className="h-4 w-4" />
                        <span className="flex-1 text-sm">{file.name}</span>
                        <Button
                          onClick={() => removeSelectedFile(index)}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Uploaded Documents */}
                {leadDocuments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Hochgeladene Dokumente:</p>
                    {leadDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 p-2 border rounded">
                        <FileText className="h-4 w-4" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.document_type} • {(doc.file_size / 1024).toFixed(1)} KB • 
                            {new Date(doc.created_at).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <Button
                          onClick={() => deleteDocument(doc.id, doc.file_path)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {leadDocuments.length === 0 && selectedFiles.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Noch keine Dokumente hochgeladen
                  </p>
                )}
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
                <div>
                  Erstellt: {new Date(editedRequest.created_at).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <Button
                  onClick={() => window.open(`mailto:${editedRequest.email}`, '_blank')}
                  variant="outline"
                  size="sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  E-Mail senden
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactRequestsManagement;