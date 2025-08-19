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
  CheckCircle, 
  Upload, 
  FileText, 
  Calendar,
  ArrowRight,
  X,
  Check
} from 'lucide-react';

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

const PostIdent1Management: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [open, setOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_contact_requests', token },
      });
      if (error) throw error;
      
      // Filter for PostIdent 1 stage
      const postident1Leads = (data?.requests || []).filter(
        (lead: Lead) => lead.lead_stage === 'postident1'
      );
      setLeads(postident1Leads);
    } catch (e) {
      console.error('Error fetching PostIdent 1 leads:', e);
      toast({ 
        title: 'Fehler', 
        description: 'PostIdent 1 Leads konnten nicht geladen werden.', 
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

  const moveToPostIdent2 = async (leadId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const { error } = await supabase.functions.invoke('admin-management', {
        body: { 
          action: 'update_contact_request_stage', 
          token, 
          id: leadId, 
          lead_stage: 'postident2' 
        },
      });
      if (error) throw error;
      
      toast({ 
        title: 'Erfolgreich', 
        description: 'Lead wurde zu PostIdent 2 verschoben.' 
      });
      
      // Remove from current list
      setLeads(prev => prev.filter(l => l.id !== leadId));
      setOpen(false);
    } catch (e) {
      console.error('Error moving to PostIdent 2:', e);
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
    setVerificationNotes('');
    setVerificationStatus('pending');
    setOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">PostIdent 1 - Erste Verifikation</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">PostIdent 1 Leads werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">PostIdent 1 - Erste Verifikation</h1>
          <p className="text-muted-foreground mt-2">
            Führen Sie die erste Identitätsprüfung und Dokumentenvalidierung durch
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
            <CheckCircle className="h-5 w-5 text-orange-500" />
            {filtered.length} Lead{filtered.length !== 1 ? 's' : ''} in PostIdent 1
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
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Verifikation ausstehend
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
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Leads in PostIdent 1</h3>
              <p className="text-muted-foreground">Alle Leads wurden bearbeitet oder es sind keine vorhanden.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-orange-500" />
              PostIdent 1 - Erste Verifikation
            </DialogTitle>
            <DialogDescription>
              Führen Sie die erste Identitätsprüfung für diesen Lead durch
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
                    <CardTitle className="text-base">Verifikation Checkliste</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 border border-muted-foreground rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full opacity-0" />
                        </div>
                        <span>Personalausweis/Pass prüfen</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 border border-muted-foreground rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full opacity-0" />
                        </div>
                        <span>Einkommensnachweis validieren</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 border border-muted-foreground rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full opacity-0" />
                        </div>
                        <span>SCHUFA-Auskunft prüfen</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 border border-muted-foreground rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full opacity-0" />
                        </div>
                        <span>Referenzen kontaktieren</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Document Upload Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Dokumente hochladen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Personalausweis</p>
                      <p className="text-xs text-muted-foreground">PDF, JPG oder PNG</p>
                    </div>
                    <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Einkommensnachweis</p>
                      <p className="text-xs text-muted-foreground">PDF oder JPG</p>
                    </div>
                    <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">SCHUFA-Auskunft</p>
                      <p className="text-xs text-muted-foreground">PDF</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Notes */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="verification-status" className="text-base font-medium">
                    Verifikationsergebnis
                  </Label>
                  <Select value={verificationStatus} onValueChange={(value: string) => setVerificationStatus(value as 'pending' | 'approved' | 'rejected')}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Status wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Ausstehend</SelectItem>
                      <SelectItem value="approved">Genehmigt</SelectItem>
                      <SelectItem value="rejected">Abgelehnt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="verification-notes" className="text-base font-medium">
                    Verifikationsnotizen
                  </Label>
                  <Textarea
                    id="verification-notes"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Notizen zur Verifikation eingeben..."
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
                  onClick={() => moveToPostIdent2(selected.id)}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowRight className="h-4 w-4" />
                  Zu PostIdent 2
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostIdent1Management;