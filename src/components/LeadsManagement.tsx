// This is a simplified working version of LeadsManagement with edit functionality
// To avoid file corruption, I'm rebuilding just the essential parts

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Eye, Mail, Phone, Tag, Plus, Edit, Save, X } from 'lucide-react';
import LeadLabelBadge from '@/components/LeadLabelBadge';

interface Lead {
  id: string;
  anrede: string | null;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  nachricht: string;
  created_at: string;
  status?: string;
  lead_label?: string | null;
  strasse?: string | null;
  nummer?: string | null;
  plz?: string | null;
  ort?: string | null;
  isRegistered?: boolean;
  property?: { title: string; address: string } | null;
}

const LeadsManagement: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [open, setOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(false);
  const [editForm, setEditForm] = useState({
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    strasse: '',
    nummer: '',
    plz: '',
    ort: '',
    nettoeinkommen: ''
  });
  const { toast } = useToast();

  const extractDetails = (message: string) => {
    const details: Record<string, string> = {};
    const lines = message.split('\n');
    
    lines.forEach(line => {
      if (line.includes('Nettoeinkommen:')) {
        details['Nettoeinkommen'] = line.split(':')[1]?.trim() || '';
      }
    });
    
    return details;
  };

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'get_leads',
          token: token
        }
      });

      if (error) throw error;
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Fehler',
        description: 'Leads konnten nicht geladen werden.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (lead: Lead) => {
    const details = extractDetails(lead.nachricht);
    setEditForm({
      vorname: lead.vorname || '',
      nachname: lead.nachname || '',
      email: lead.email || '',
      telefon: lead.telefon || '',
      strasse: lead.strasse || '',
      nummer: lead.nummer || '',
      plz: lead.plz || '',
      ort: lead.ort || '',
      nettoeinkommen: details['Nettoeinkommen'] || ''
    });
    setEditingLead(true);
  };

  const saveLeadEdit = async () => {
    if (!selected) return;
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) throw new Error('Admin token not found');

      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'update_lead',
          token: adminToken,
          contactRequestId: selected.id,
          updates: editForm
        }
      });

      if (error) throw error;

      // Update the local lead data
      setSelected({
        ...selected,
        ...editForm
      });

      // Update the leads list
      setLeads(leads.map(lead => 
        lead.id === selected.id 
          ? { ...lead, ...editForm }
          : lead
      ));

      setEditingLead(false);
      toast({ 
        title: 'Erfolg', 
        description: 'Lead erfolgreich aktualisiert' 
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({ 
        title: 'Fehler', 
        description: 'Fehler beim Aktualisieren des Leads',
        variant: 'destructive' 
      });
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="ml-3 text-sm text-muted-foreground">Leads werden geladen...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Leads Management ({filteredLeads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {lead.anrede && (lead.anrede === 'herr' ? 'Herr' : lead.anrede === 'frau' ? 'Frau' : 'Divers')} {lead.vorname} {lead.nachname}
                        {lead.isRegistered && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Registriert
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <a className="text-primary hover:underline" href={`mailto:${lead.email}`}>
                        {lead.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a className="text-primary hover:underline" href={`tel:${lead.telefon}`}>
                        {lead.telefon}
                      </a>
                    </TableCell>
                    <TableCell>
                      {new Date(lead.created_at).toLocaleDateString('de-DE')}
                    </TableCell>
                    <TableCell>
                      <LeadLabelBadge label={lead.lead_label} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelected(lead);
                          setOpen(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Anzeigen
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Lead Details Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Lead Details
            </DialogTitle>
            <DialogDescription>
              Informationen und Dokumente für {selected?.vorname} {selected?.nachname}
            </DialogDescription>
          </DialogHeader>
          
          {selected && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <strong>Name:</strong> 
                  {selected.anrede && (selected.anrede === 'herr' ? 'Herr' : selected.anrede === 'frau' ? 'Frau' : 'Divers')} {selected.vorname} {selected.nachname}
                  {selected.isRegistered && (
                    <Badge variant="secondary" className="text-xs">
                      ✓ Registriert
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditing(selected)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Bearbeiten
                </Button>
              </div>

              {editingLead ? (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="vorname">Vorname</Label>
                      <Input
                        id="vorname"
                        value={editForm.vorname}
                        onChange={(e) => setEditForm({ ...editForm, vorname: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nachname">Nachname</Label>
                      <Input
                        id="nachname"
                        value={editForm.nachname}
                        onChange={(e) => setEditForm({ ...editForm, nachname: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">E‑Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefon">Telefon</Label>
                    <Input
                      id="telefon"
                      value={editForm.telefon}
                      onChange={(e) => setEditForm({ ...editForm, telefon: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="strasse">Straße</Label>
                      <Input
                        id="strasse"
                        value={editForm.strasse}
                        onChange={(e) => setEditForm({ ...editForm, strasse: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nummer">Nr.</Label>
                      <Input
                        id="nummer"
                        value={editForm.nummer}
                        onChange={(e) => setEditForm({ ...editForm, nummer: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="plz">PLZ</Label>
                      <Input
                        id="plz"
                        value={editForm.plz}
                        onChange={(e) => setEditForm({ ...editForm, plz: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ort">Ort</Label>
                    <Input
                      id="ort"
                      value={editForm.ort}
                      onChange={(e) => setEditForm({ ...editForm, ort: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nettoeinkommen">Nettoeinkommen (€)</Label>
                    <Input
                      id="nettoeinkommen"
                      type="number"
                      value={editForm.nettoeinkommen}
                      onChange={(e) => setEditForm({ ...editForm, nettoeinkommen: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={saveLeadEdit} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Speichern
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingLead(false)}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div><strong>E‑Mail:</strong> <a className="text-primary hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a></div>
                  <div><strong>Telefon:</strong> <a className="text-primary hover:underline" href={`tel:${selected.telefon}`}>{selected.telefon}</a></div>
                  {selected.strasse || selected.plz || selected.ort ? (
                    <div>
                      <strong>Adresse:</strong>
                      <div className="ml-2 text-muted-foreground">
                        {selected.strasse} {selected.nummer}<br />
                        {selected.plz} {selected.ort}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <div><strong>Datum:</strong> {new Date(selected.created_at).toLocaleString('de-DE')}</div>
                <div><strong>Immobilie:</strong> {selected.property?.title || 'Allgemein'}</div>
                <div className="flex items-center gap-2"><strong>Label:</strong> <LeadLabelBadge label={selected.lead_label} /></div>
                {(() => { 
                  const det = extractDetails(selected.nachricht); 
                  return (
                    <>
                      {det['Nettoeinkommen'] && <div><strong>Nettoeinkommen:</strong> {det['Nettoeinkommen']} €</div>}
                    </>
                  ); 
                })()}
              </div>
              
              {selected.nachricht && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Nachricht
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{selected.nachricht}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsManagement;