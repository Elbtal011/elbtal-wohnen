import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Calendar, Building2, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

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
  property?: {
    title: string;
    address: string;
  };
}

const ContactRequestsManagement = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
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

  const handleViewRequest = (request: ContactRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
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

      {/* View Request Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kontaktanfrage Details</DialogTitle>
            <DialogDescription>
              Vollständige Informationen zur Kontaktanfrage
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Persönliche Daten</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {selectedRequest.anrede && `${selectedRequest.anrede === 'herr' ? 'Herr' : selectedRequest.anrede === 'frau' ? 'Frau' : 'Divers'} `}{selectedRequest.vorname} {selectedRequest.nachname}</div>
                      <div><strong>E-Mail:</strong> <a href={`mailto:${selectedRequest.email}`} className="text-primary hover:underline">{selectedRequest.email}</a></div>
                      <div><strong>Telefon:</strong> <a href={`tel:${selectedRequest.telefon}`} className="text-primary hover:underline">{selectedRequest.telefon}</a></div>
                    </div>
                  </div>

                  {(selectedRequest.strasse || selectedRequest.nummer || selectedRequest.plz || selectedRequest.ort) && (
                    <div>
                      <h4 className="font-semibold mb-2">Adresse</h4>
                      <div className="space-y-1 text-sm">
                        {selectedRequest.strasse && <div>{selectedRequest.strasse} {selectedRequest.nummer}</div>}
                        {(selectedRequest.plz || selectedRequest.ort) && (
                          <div>{selectedRequest.plz} {selectedRequest.ort}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Anfrage Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Datum:</strong> {new Date(selectedRequest.created_at).toLocaleDateString('de-DE', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</div>
                      <div><strong>Status:</strong> 
                        <Badge variant={getStatusVariant(selectedRequest.status)} className="ml-2">
                          {getStatusLabel(selectedRequest.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {selectedRequest.property && (
                    <div>
                      <h4 className="font-semibold mb-2">Immobilie</h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Titel:</strong> {selectedRequest.property.title}</div>
                        <div><strong>Adresse:</strong> {selectedRequest.property.address}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Nachricht</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedRequest.nachricht}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Schließen
                </Button>
                <Button onClick={() => {
                  window.location.href = `mailto:${selectedRequest.email}?subject=Re: Ihre Anfrage&body=Hallo ${selectedRequest.vorname} ${selectedRequest.nachname},%0D%0A%0D%0AVielen Dank für Ihre Anfrage...`;
                }}>
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