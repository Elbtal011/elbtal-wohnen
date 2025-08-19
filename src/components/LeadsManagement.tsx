import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Eye, Mail, Phone, Tag, Plus, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import LeadLabelBadge from '@/components/LeadLabelBadge';
import AddLeadDialog from '@/components/AddLeadDialog';
import { Checkbox } from '@/components/ui/checkbox';

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
  property?: { title: string; address: string } | null;
  strasse?: string | null;
  nummer?: string | null;
  plz?: string | null;
  ort?: string | null;
}

const DEFAULT_LABELS = ['Cold', 'Warm', 'Hot Lead', 'VIP', 'Follow-Up', 'Unqualified', 'Converted'];

const LeadsManagement: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [open, setOpen] = useState(false);
const { toast } = useToast();
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_contact_requests', token },
      });
      if (error) throw error;
      setLeads(data?.requests || []);
    } catch (e) {
      console.error('Error fetching leads:', e);
      toast({ title: 'Fehler', description: 'Leads konnten nicht geladen werden.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  // selection helpers
  const isSelected = (id: string) => selectedIds.has(id);
  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const copy = new Set(prev);
      if (checked) copy.add(id); else copy.delete(id);
      return copy;
    });
  };
  const selectAllFiltered = (checked: boolean) => {
    setSelectedIds(prev => {
      if (!checked) return new Set(filtered.map(l => l.id));
      // if header checkbox was checked -> uncheck all
      const next = new Set(prev);
      filtered.forEach(l => next.delete(l.id));
      return next;
    });
  };

  const uniqueLabels = useMemo(() => {
    const set = new Set<string>();
    leads.forEach(l => { if (l.lead_label) set.add(l.lead_label); });
    return Array.from(set);
  }, [leads]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return leads.filter(l => {
      const matchesLabel =
        labelFilter === 'all'
          ? true
          : labelFilter === '__none__'
            ? !l.lead_label
            : (l.lead_label || '') === labelFilter;

      const matchesSearch = !s ? true : [
        l.vorname, l.nachname, l.email, l.telefon, l.property?.title
      ].filter(Boolean).some(v => String(v).toLowerCase().includes(s));

      const created = new Date(l.created_at);
      const fromOk = !fromDate || created >= new Date(new Date(fromDate).setHours(0, 0, 0, 0));
      const toOk = !toDate || created <= new Date(new Date(toDate).setHours(23, 59, 59, 999));

      return matchesLabel && matchesSearch && fromOk && toOk;
    });
  }, [leads, labelFilter, search, fromDate, toDate]);

  const extractDetails = (msg?: string) => {
    const res: Record<string, string> = {};
    if (!msg) return res;
    msg.split('\n').forEach((line) => {
      const idx = line.indexOf(':');
      if (idx > -1) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        if (key && val) res[key] = val;
      }
    });
    return res;
  };

  const handleExportCSV = () => {
    const items = selectedIds.size ? filtered.filter(l => selectedIds.has(l.id)) : filtered;
    const headers = [
      'Datum', 'Anrede', 'Vorname', 'Nachname', 'E-Mail', 'Telefon', 'Immobilie', 'Label', 'Nachricht'
    ];
    const rows = items.map(l => [
      new Date(l.created_at).toLocaleString('de-DE'),
      l.anrede ?? '',
      l.vorname,
      l.nachname,
      l.email,
      l.telefon,
      l.property?.title || 'Allgemein',
      l.lead_label || '',
      (l.nachricht || '').replace(/\n/g, ' ')
    ]);
    const csvContent = [headers, ...rows]
      .map(r => r.map(val => {
        const s = String(val ?? '');
        const needsQuotes = /[";,\n]/.test(s);
        return needsQuotes ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(';'))
      .join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedIds.size ? 'leads-auswahl.csv' : 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export erfolgreich', description: `${rows.length} Zeilen als CSV exportiert.` });
  };

  const handleExportXLSX = () => {
    const items = selectedIds.size ? filtered.filter(l => selectedIds.has(l.id)) : filtered;
    const data = items.map(l => ({
      Datum: new Date(l.created_at).toLocaleString('de-DE'),
      Anrede: l.anrede ?? '',
      Vorname: l.vorname,
      Nachname: l.nachname,
      EMail: l.email,
      Telefon: l.telefon,
      Immobilie: l.property?.title || 'Allgemein',
      Label: l.lead_label || '',
      Nachricht: l.nachricht || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, selectedIds.size ? 'leads-auswahl.xlsx' : 'leads.xlsx');
    toast({ title: 'Export erfolgreich', description: `${data.length} Zeilen als XLSX exportiert.` });
  };

  const updateLabel = async (leadId: string, newLabel: string | null) => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { action: 'update_contact_request_label', token, id: leadId, lead_label: newLabel },
      });
      if (error) throw error;
      toast({ title: 'Label aktualisiert', description: 'Lead-Label wurde gespeichert.' });
      setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, lead_label: data?.request?.lead_label ?? newLabel } : l)));
    } catch (e) {
      console.error('Error updating label:', e);
      toast({ title: 'Fehler', description: 'Label konnte nicht aktualisiert werden.', variant: 'destructive' });
    }
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    if (!confirm(`Möchtest du ${ids.length} Lead(s) löschen?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { action: 'delete_contact_requests', token, ids }
      });
      if (error) throw error;
      setLeads(prev => prev.filter(l => !selectedIds.has(l.id)));
      setSelectedIds(new Set());
      toast({ title: 'Gelöscht', description: `${ids.length} Lead(s) wurden gelöscht.` });
    } catch (e) {
      console.error('Delete leads error:', e);
      toast({ title: 'Fehler', description: 'Leads konnten nicht gelöscht werden.', variant: 'destructive' });
    }
  };

  const openDetails = (lead: Lead) => {
    setSelected(lead);
    setOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Leads</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Leads werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Leads</h1>
        <div className="flex flex-col lg:flex-row gap-3 w-full md:w-auto">
          <div className="flex-1 sm:w-72">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen (Name, E‑Mail, Telefon, Immobilie)" />
          </div>
          <Select value={labelFilter} onValueChange={setLabelFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Label filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Labels</SelectItem>
              <SelectItem value="__none__">Ohne Label</SelectItem>
              {uniqueLabels.map(l => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-36 justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                {fromDate ? fromDate.toLocaleDateString('de-DE') : 'Von'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarUI
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-36 justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                {toDate ? toDate.toLocaleDateString('de-DE') : 'Bis'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarUI
                mode="single"
                selected={toDate}
                onSelect={setToDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <div className="flex gap-2 items-center">
            {selectedIds.size > 0 && (
              <>
                <span className="text-sm text-muted-foreground">{selectedIds.size} ausgewählt</span>
                <Button variant="destructive" onClick={handleDeleteSelected} className="hover-scale"><Trash2 className="h-4 w-4 mr-1" /> Löschen</Button>
              </>
            )}
            <Button variant="secondary" onClick={handleExportCSV} className="hover-scale">Export CSV</Button>
            <Button variant="outline" onClick={handleExportXLSX} className="hover-scale">Export XLSX</Button>
            <Button onClick={() => setOpenAdd(true)} className="hover-scale"><Plus className="h-4 w-4 mr-1" /> Lead hinzufügen</Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {filtered.length} Lead{filtered.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={filtered.length > 0 && filtered.every(l => selectedIds.has(l.id))}
                        onCheckedChange={(v) => {
                          const allIds = new Set(filtered.map(l => l.id));
                          const isAllSelected = filtered.every(l => selectedIds.has(l.id));
                          setSelectedIds(isAllSelected ? new Set() : allIds);
                        }}
                        aria-label="Alle auswählen"
                      />
                    </TableHead>
                    <TableHead className="min-w-[160px]">Name</TableHead>
                    <TableHead className="min-w-[200px]">Kontakt</TableHead>
                    <TableHead className="min-w-[160px]">Label</TableHead>
                    <TableHead className="min-w-[100px]">Datum</TableHead>
                    <TableHead className="min-w-[160px]">Immobilie</TableHead>
                    <TableHead className="text-right min-w-[100px]">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((lead) => (
                    <TableRow key={lead.id} className={isSelected(lead.id) ? 'bg-muted/40' : ''}>
                      <TableCell className="w-10">
                        <Checkbox
                          checked={isSelected(lead.id)}
                          onCheckedChange={(v) => toggleSelect(lead.id, Boolean(v))}
                          aria-label="Lead auswählen"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {lead.anrede && (lead.anrede === 'herr' ? 'Hr.' : lead.anrede === 'frau' ? 'Fr.' : 'Divers')}{' '}
                          {lead.vorname} {lead.nachname}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[220px]">{lead.nachricht}</div>
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
                        <div className="flex items-center gap-2">
                          <LeadLabelBadge label={lead.lead_label} />
                          <Select
                            value={lead.lead_label ?? 'none'}
                            onValueChange={(v) => updateLabel(lead.id, v === 'none' ? null : v)}
                          >
                            <SelectTrigger className="w-36 text-xs">
                              <SelectValue placeholder="Label setzen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Ohne Label</SelectItem>
                              {Array.from(new Set([...DEFAULT_LABELS, ...uniqueLabels])).map(l => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          {new Date(lead.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs truncate max-w-[180px]">{lead.property?.title || 'Allgemein'}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="p-2" onClick={() => openDetails(lead)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Leads gefunden</h3>
              <p className="text-muted-foreground">Es wurden noch keine Leads erfasst.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>Vollständige Informationen zum Lead</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <div><strong>Name:</strong> {selected.anrede && (selected.anrede === 'herr' ? 'Herr' : selected.anrede === 'frau' ? 'Frau' : 'Divers')} {selected.vorname} {selected.nachname}</div>
                  <div><strong>E‑Mail:</strong> <a className="text-primary hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a></div>
                  <div><strong>Telefon:</strong> <a className="text-primary hover:underline" href={`tel:${selected.telefon}`}>{selected.telefon}</a></div>
                  {selected.strasse || selected.plz || selected.ort ? (
                    <div>
                      <strong>Adresse:</strong>
                      <div>{selected.strasse} {selected.nummer}</div>
                      <div>{selected.plz} {selected.ort}</div>
                    </div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <div><strong>Datum:</strong> {new Date(selected.created_at).toLocaleString('de-DE')}</div>
                  <div><strong>Immobilie:</strong> {selected.property?.title || 'Allgemein'}</div>
                  <div className="flex items-center gap-2"><strong>Label:</strong> <LeadLabelBadge label={selected.lead_label} /></div>
                  {(() => { const det = extractDetails(selected.nachricht); return (
                    <>
                      {det['Geburtsdatum'] && <div><strong>Geburtsdatum:</strong> {det['Geburtsdatum']}</div>}
                      {det['Einzugsdatum'] && <div><strong>Einzugsdatum:</strong> {det['Einzugsdatum']}</div>}
                      {det['Nettoeinkommen'] && <div><strong>Nettoeinkommen:</strong> {det['Nettoeinkommen']} €</div>}
                      {det['Geburtsort'] && <div><strong>Geburtsort:</strong> {det['Geburtsort']}</div>}
                      {det['Staatsangehörigkeit'] && <div><strong>Staatsangehörigkeit:</strong> {det['Staatsangehörigkeit']}</div>}
                    </>
                  ); })()}
                </div>
              </div>
              {selected.nachricht && (
                <div>
                  <h4 className="font-semibold mb-2">Nachricht</h4>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{selected.nachricht}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddLeadDialog
        open={openAdd}
        onOpenChange={setOpenAdd}
        availableLabels={Array.from(new Set([...DEFAULT_LABELS, ...uniqueLabels]))}
        onCreated={fetchLeads}
      />
    </div>
  );
};

export default LeadsManagement;
