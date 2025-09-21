import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  Mail, 
  Phone, 
  UserCheck, 
  VideoIcon, 
  FileCheck, 
  Calendar,
  ArrowRight,
  X,
  Check,
  Shield
} from 'lucide-react';
import DocumentUploadSection from '@/components/DocumentUploadSection';

interface Lead {
  id: string;
  anrede: string | null;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  nachricht: string;
  created_at: string;
  lead_stage?: string;
  property?: { title: string; address: string } | null;
  strasse?: string | null;
  nummer?: string | null;
  plz?: string | null;
  ort?: string | null;
}

interface AdminUser {
  id: string;
  username: string;
  role: string;
}

interface PostIdent2ManagementProps {
  adminUser?: AdminUser;
}

const PostIdent2Management: React.FC<PostIdent2ManagementProps> = ({ adminUser }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [open, setOpen] = useState(false);
  const [finalNotes, setFinalNotes] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [documents, setDocuments] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_contact_requests', token },
      });
      if (error) throw error;
      
      // Filter for PostIdent 2 stage
      const postident2Leads = (data?.requests || []).filter(
        (lead: Lead) => lead.lead_stage === 'postident2'
      );
      setLeads(postident2Leads);
    } catch (e) {
      console.error('Error fetching PostIdent 2 leads:', e);
      toast({ 
        title: 'Fehler', 
        description: 'PostIdent 2 Leads konnten nicht geladen werden.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchLeads(); 
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return leads.filter(l => {
      return !s || [
        l.vorname, l.nachname, l.email, l.telefon, l.property?.title
      ].filter(Boolean).some(v => String(v).toLowerCase().includes(s));
    });
  }, [leads, search]);

  const moveToContract = async (leadId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const { error } = await supabase.functions.invoke('admin-management', {
        body: { 
          action: 'update_contact_request_stage', 
          token, 
          id: leadId, 
          lead_stage: 'contract' 
        },
      });
      if (error) throw error;
      
      toast({ 
        title: 'Erfolgreich', 
        description: 'Lead wurde zur Vertragsverhandlung verschoben.' 
      });
      
      // Remove from current list
      setLeads(prev => prev.filter(l => l.id !== leadId));
      setOpen(false);
    } catch (e) {
      console.error('Error moving to contract:', e);
      toast({ 
        title: 'Fehler', 
        description: 'Lead konnte nicht verschoben werden.', 
        variant: 'destructive' 
      });
    }
  };

  const rejectLead = async (leadId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const { error } = await supabase.functions.invoke('admin-management', {
        body: { 
          action: 'update_contact_request_stage', 
          token, 
          id: leadId, 
          lead_stage: 'rejected' 
        },
      });
      if (error) throw error;
      
      toast({ 
        title: 'Lead abgelehnt', 
        description: 'Lead wurde abgelehnt und archiviert.' 
      });
      
      // Remove from current list
      setLeads(prev => prev.filter(l => l.id !== leadId));
      setOpen(false);
    } catch (e) {
      console.error('Error rejecting lead:', e);
      toast({ 
        title: 'Fehler', 
        description: 'Lead konnte nicht abgelehnt werden.', 
        variant: 'destructive' 
      });
    }
  };

  const openDetails = (lead: Lead) => {
    setSelected(lead);
    setFinalNotes('');
    setVerificationStatus('pending');
    setOpen(true);
    fetchDocuments(lead.id);
  };

  const fetchDocuments = async (contactRequestId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'get_lead_documents',
          token,
          contactRequestId
        }
      });

      if (error) throw error;
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const startVideoCall = () => {
    toast({
      title: 'Video-Anruf gestartet',
      description: 'Video-Identifikation wird initiiert...'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">PostIdent 2 - Finale Verifikation</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">PostIdent 2 Leads werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">PostIdent 2 - Finale Verifikation</h1>
          <p className="text-muted-foreground mt-2">
            Führen Sie die finale Video-Identifikation und Dokumentenprüfung durch
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 sm:w-72">
            <Input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Suchen (Name, E‑Mail, Telefon)" 
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-500" />
            {filtered.length} Lead{filtered.length !== 1 ? 's' : ''} in PostIdent 2
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[160px]">Name</TableHead>
                    <TableHead className="min-w-[200px]">Kontakt</TableHead>
                    <TableHead className="min-w-[100px]">Eingangsdatum</TableHead>
                    <TableHead className="min-w-[160px]">Immobilie</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="text-right min-w-[120px]">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {lead.anrede && (lead.anrede === 'herr' ? 'Hr.' : lead.anrede === 'frau' ? 'Fr.' : 'Divers')}{' '}
                          {lead.vorname} {lead.nachname}
                        </div>
                        {(lead.plz || lead.ort) && (
                          <div className="text-xs text-muted-foreground">{lead.plz} {lead.ort}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3" />
                            <span className="truncate">{lead.telefon}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          {new Date(lead.created_at).toLocaleDateString('de-DE')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs truncate max-w-[180px]">
                          {lead.property?.title || 'Allgemein'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Video-Verifikation
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openDetails(lead)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Prüfen
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Leads in PostIdent 2</h3>
              <p className="text-muted-foreground">Alle Leads wurden bearbeitet oder es sind keine vorhanden.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-500" />
              PostIdent 2 - Finale Verifikation
            </DialogTitle>
            <DialogDescription>
              Führen Sie die finale Video-Identifikation für diesen Lead durch
            </DialogDescription>
          </DialogHeader>
          
          {selected && (
            <div className="space-y-6">
              {/* Lead Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Persönliche Daten</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selected.anrede && (selected.anrede === 'herr' ? 'Herr' : selected.anrede === 'frau' ? 'Frau' : 'Divers')} {selected.vorname} {selected.nachname}</div>
                    <div><strong>E‑Mail:</strong> <a className="text-primary hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a></div>
                    <div><strong>Telefon:</strong> <a className="text-primary hover:underline" href={`tel:${selected.telefon}`}>{selected.telefon}</a></div>
                    {(selected.strasse || selected.plz || selected.ort) && (
                      <div>
                        <strong>Adresse:</strong>
                        <div>{selected.strasse} {selected.nummer}</div>
                        <div>{selected.plz} {selected.ort}</div>
                      </div>
                    )}
                    <div><strong>Eingangsdatum:</strong> {new Date(selected.created_at).toLocaleString('de-DE')}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Video-Verifikation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <VideoIcon className="h-12 w-12 text-blue-600" />
                      </div>
                      <Button 
                        onClick={startVideoCall}
                        className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        <VideoIcon className="h-4 w-4" />
                        Video-Anruf starten
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      Führen Sie eine Live-Video-Verifikation mit dem Interessenten durch
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Document Upload/View Section */}
              <DocumentUploadSection
                contactRequestId={selected.id}
                documents={documents}
                onDocumentsUpdate={() => fetchDocuments(selected.id)}
              />
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Finale Verifikation Checkliste
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Dokumentenprüfung</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-4 h-4 border border-muted-foreground rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full opacity-0" />
                          </div>
                          <span>Personalausweis Live-Abgleich</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-4 h-4 border border-muted-foreground rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full opacity-0" />
                          </div>
                          <span>Gesichtserkennung bestätigt</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-4 h-4 border border-muted-foreground rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full opacity-0" />
                          </div>
                          <span>Sicherheitsmerkmale geprüft</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Interview</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-4 h-4 border border-muted-foreground rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full opacity-0" />
                          </div>
                          <span>Persönliche Fragen beantwortet</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-4 h-4 border border-muted-foreground rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full opacity-0" />
                          </div>
                          <span>Einkommenssituation bestätigt</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-4 h-4 border border-muted-foreground rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full opacity-0" />
                          </div>
                          <span>Vertragskonditionen besprochen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Final Assessment */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="final-status" className="text-base font-medium">
                    Finales Verifikationsergebnis
                  </Label>
                  <Select value={verificationStatus} onValueChange={(value: string) => setVerificationStatus(value as 'pending' | 'approved' | 'rejected')}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Status wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Ausstehend</SelectItem>
                      <SelectItem value="approved">Vollständig verifiziert</SelectItem>
                      <SelectItem value="rejected">Verifikation fehlgeschlagen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="final-notes" className="text-base font-medium">
                    Abschließende Notizen
                  </Label>
                  <Textarea
                    id="final-notes"
                    value={finalNotes}
                    onChange={(e) => setFinalNotes(e.target.value)}
                    placeholder="Ergebnis der finalen Verifikation und nächste Schritte..."
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Schließen
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => rejectLead(selected.id)}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Ablehnen
                </Button>
                <Button 
                  onClick={() => moveToContract(selected.id)}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <FileCheck className="h-4 w-4" />
                  Zur Vertragsverhandlung
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostIdent2Management;