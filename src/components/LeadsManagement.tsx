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
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Eye, Mail, Phone, Tag, Plus, Trash2, ArrowRight, Download, FileText, Upload, X } from 'lucide-react';
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
  lead_stage?: string | null;
  property?: { title: string; address: string } | null;
  strasse?: string | null;
  nummer?: string | null;
  plz?: string | null;
  ort?: string | null;
  isRegistered?: boolean;
  user_id?: string | null;
  applications?: PropertyApplication[];
  hasDocuments?: boolean;
}

interface PropertyApplication {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  status: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  adresse: string;
  postleitzahl: string;
  ort: string;
  geburtsort: string;
  staatsangehoerigkeit: string;
  geburtsdatum: string;
  nettoeinkommen: number;
  einzugsdatum: string;
  nachricht: string;
  property?: {
    title: string;
    address: string;
    city?: { name: string };
  };
}

interface UserDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
}

interface LeadDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_by: string;
  created_at: string;
}

const DEFAULT_LABELS = [
  'Kalt',
  'Warm', 
  'PI 1 erstellt',
  'PI 2 erstellt',
  'Unterlagen erhalten - PI senden',
  'Besichtigung vereinbaren',
  'Hot Lead',
  'Property Application'
];

const LeadsManagement: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [registeredEmails, setRegisteredEmails] = useState<Set<string>>(new Set());
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [leadDocuments, setLeadDocuments] = useState<LeadDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      // Fetch both leads and registered users
      const [leadsResult, membersResult] = await Promise.all([
        supabase.functions.invoke('admin-management', {
          body: { action: 'get_contact_requests', token },
        }),
        supabase.functions.invoke('admin-management', {
          body: { action: 'get_members', token },
        })
      ]);

      if (leadsResult.error) throw leadsResult.error;
      if (membersResult.error) throw membersResult.error;

      // Create a set of registered emails for quick lookup
      const memberEmails = new Set<string>();
      (membersResult.data?.members || []).forEach((member: any) => {
        if (member.email && typeof member.email === 'string') {
          memberEmails.add(member.email.toLowerCase());
        }
      });
      setRegisteredEmails(memberEmails);

      // Add registration status and user_id to leads
      const leadsWithStatus = (leadsResult.data?.requests || []).map((lead: Lead) => {
        const member = (membersResult.data?.members || []).find((m: any) => 
          m.email && lead.email && m.email.toLowerCase() === lead.email.toLowerCase()
        );
        return {
          ...lead,
          isRegistered: memberEmails.has(lead.email?.toLowerCase()),
          user_id: member ? member.user_id : null
        };
      });

      // Check for documents for registered users
      const leadsWithDocuments = await Promise.all(
        leadsWithStatus.map(async (lead) => {
          if (lead.isRegistered && lead.user_id) {
            try {
              const { data } = await supabase.functions.invoke('admin-management', {
                body: {
                  action: 'get_user_documents',
                  token,
                  user_id: lead.user_id
                }
              });
              return {
                ...lead,
                hasDocuments: (data?.documents || []).length > 0
              };
            } catch {
              return { ...lead, hasDocuments: false };
            }
          }
          return { ...lead, hasDocuments: false };
        })
      );

      setLeads(leadsWithDocuments);
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
    leads.forEach(l => { 
      if (l.lead_label && DEFAULT_LABELS.includes(l.lead_label)) {
        set.add(l.lead_label); 
      }
    });
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

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [labelFilter, search, fromDate, toDate]);

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

  const moveToPostIdent1 = async (leadId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const { error } = await supabase.functions.invoke('admin-management', {
        body: { 
          action: 'update_contact_request_stage', 
          token, 
          id: leadId, 
          lead_stage: 'postident1' 
        },
      });
      if (error) throw error;
      
      toast({ 
        title: 'Erfolgreich', 
        description: 'Lead wurde zu PostIdent 1 verschoben.' 
      });
      
      // Update the lead in the current list
      setLeads(prev => prev.map(l => 
        l.id === leadId ? { ...l, lead_stage: 'postident1' } : l
      ));
    } catch (e) {
      console.error('Error moving to PostIdent 1:', e);
      toast({ 
        title: 'Fehler', 
        description: 'Lead konnte nicht verschoben werden.', 
        variant: 'destructive' 
      });
    }
  };

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
      
      // Update the lead in the current list
      setLeads(prev => prev.map(l => 
        l.id === leadId ? { ...l, lead_stage: 'postident2' } : l
      ));
    } catch (e) {
      console.error('Error moving to PostIdent 2:', e);
      toast({ 
        title: 'Fehler', 
        description: 'Lead konnte nicht verschoben werden.', 
        variant: 'destructive' 
      });
    }
  };

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
      
      // Update the lead in the current list
      setLeads(prev => prev.map(l => 
        l.id === leadId ? { ...l, lead_stage: 'contract' } : l
      ));
    } catch (e) {
      console.error('Error moving to contract:', e);
      toast({ 
        title: 'Fehler', 
        description: 'Lead konnte nicht verschoben werden.', 
        variant: 'destructive' 
      });
    }
  };

  const fetchUserDocuments = async (userId: string) => {
    try {
      setLoadingDocuments(true);
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) throw new Error('Admin token not found');

      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'get_user_documents',
          token: adminToken,
          user_id: userId
        }
      });

      if (error) throw error;
      setUserDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching user documents:', error);
      toast({ title: 'Fehler', description: 'Dokumente konnten nicht geladen werden.', variant: 'destructive' });
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchLeadDocuments = async (contactRequestId: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) throw new Error('Admin token not found');

      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'get_lead_documents',
          token: adminToken,
          contactRequestId: contactRequestId
        }
      });

      if (error) throw error;
      setLeadDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching lead documents:', error);
      setLeadDocuments([]);
    }
  };

  const downloadDocument = async (filePath: string, fileName: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) throw new Error('Admin token not found');

      // Check if it's a user document or lead document
      const isUserDocument = userDocuments.some(doc => doc.file_path === filePath);
      const action = isUserDocument ? 'get_user_document_download_url' : 'get_lead_document_download_url';

      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: action,
          token: adminToken,
          filePath: filePath
        }
      });

      if (error) throw error;

      if (data.url) {
        // Open document in new tab instead of downloading
        window.open(data.url, '_blank');
      } else {
        throw new Error('No download URL received');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      toast({ title: 'Fehler', description: 'Fehler beim Öffnen des Dokuments', variant: 'destructive' });
    }
  };

  const handleDocumentUpload = async (files: File[]) => {
    if (!selected || files.length === 0) return;
    
    try {
      setUploadingDocument(true);
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) throw new Error('Admin token not found');

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      const fileArray = files.filter((file) => allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024);

      let successCount = 0;

      const uploadPromises = fileArray.map(async (file) => {
        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64Data = reader.result as string;
              
              const { error } = await supabase.functions.invoke('admin-management', {
                body: {
                  action: 'upload_lead_document',
                  token: adminToken,
                  contactRequestId: selected.id,
                  documentType: 'admin_upload',
                  fileName: file.name,
                  fileData: base64Data,
                  contentType: file.type
                }
              });

              if (error) throw error;
              successCount += 1;
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
          reader.readAsDataURL(file);
        });
      });

      await Promise.allSettled(uploadPromises);

      toast({ 
        title: 'Dokumente hochgeladen', 
        description: `${successCount} Dokument(e) wurden erfolgreich hochgeladen.`,
      });

      // Refresh documents
      if (selected.user_id) {
        fetchUserDocuments(selected.user_id);
      }
      fetchLeadDocuments(selected.id);
    } catch (error: any) {
      console.error('Error uploading documents:', error);
      toast({ 
        title: 'Fehler', 
        description: error?.message || 'Dokumente konnten nicht hochgeladen werden.', 
        variant: 'destructive' 
      });
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteLeadDocument = async (documentId: string, filePath: string) => {
    if (!confirm('Möchten Sie dieses Dokument wirklich löschen?')) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) throw new Error('Admin token not found');

      const { error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'delete_lead_document',
          token: adminToken,
          documentId: documentId,
          filePath: filePath
        }
      });

      if (error) throw error;

      toast({ 
        title: 'Dokument gelöscht', 
        description: 'Das Dokument wurde erfolgreich gelöscht.' 
      });

      // Refresh lead documents
      if (selected) {
        fetchLeadDocuments(selected.id);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({ 
        title: 'Fehler', 
        description: 'Dokument konnte nicht gelöscht werden.', 
        variant: 'destructive' 
      });
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'gehaltsnachweis':
        return 'Gehaltsnachweise';
      case 'kontoauszug':
        return 'Kontoauszug';
      case 'personalausweis':
        return 'Personalausweis/Reisepass';
      case 'admin_upload':
        return 'Admin Dokument';
      default:
        return type;
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const { error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'update_application_status',
          token,
          applicationId,
          status
        }
      });

      if (error) throw error;

      toast({ 
        title: 'Status aktualisiert', 
        description: 'Bewerbungsstatus wurde erfolgreich geändert.' 
      });

      // Update the application status in the selected lead's applications
      if (selected) {
        const updatedLead = {
          ...selected,
          applications: selected.applications?.map(app => 
            app.id === applicationId ? { ...app, status } : app
          )
        };
        setSelected(updatedLead);
        
        // Also update in the leads list
        setLeads(prev => prev.map(lead => 
          lead.id === selected.id ? updatedLead : lead
        ));
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({ 
        title: 'Fehler', 
        description: 'Status konnte nicht aktualisiert werden.', 
        variant: 'destructive' 
      });
    }
  };

  const openDetails = (lead: Lead) => {
    setSelected(lead);
    setOpen(true);
    // Fetch documents if user is registered
    if (lead.isRegistered && lead.user_id) {
      fetchUserDocuments(lead.user_id);
    } else {
      setUserDocuments([]);
    }
    // Always fetch lead documents uploaded by admin
    fetchLeadDocuments(lead.id);
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
            {totalPages > 1 && (
              <span className="text-muted-foreground font-normal text-base ml-2">
                (Seite {currentPage} von {totalPages})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
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
                    <TableHead className="min-w-[140px]">Lead</TableHead>
                    <TableHead className="min-w-[160px] hidden md:table-cell">Kontakt</TableHead>
                    <TableHead className="min-w-[80px] hidden lg:table-cell">Staat</TableHead>
                    <TableHead className="min-w-[80px] hidden lg:table-cell">Einkommen</TableHead>
                    <TableHead className="min-w-[100px] hidden sm:table-cell">Label</TableHead>
                    <TableHead className="min-w-[70px] hidden sm:table-cell">Datum</TableHead>
                    <TableHead className="min-w-[100px] hidden md:table-cell">Immobilie</TableHead>
                    <TableHead className="min-w-[120px]">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                 <TableBody>
                   {paginatedLeads.map((lead) => {
                    const details = extractDetails(lead.nachricht);
                    return (
                      <TableRow key={lead.id} className={isSelected(lead.id) ? 'bg-muted/40' : ''}>
                        <TableCell className="w-8">
                          <Checkbox
                            checked={isSelected(lead.id)}
                            onCheckedChange={(v) => toggleSelect(lead.id, Boolean(v))}
                            aria-label="Lead auswählen"
                          />
                        </TableCell>
                         <TableCell>
                           <div className="space-y-1">
                             <div className="font-medium text-sm">
                               {lead.anrede && (lead.anrede === 'herr' ? 'Hr.' : lead.anrede === 'frau' ? 'Fr.' : 'Divers')}{' '}
                               {lead.vorname} {lead.nachname}
                             </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge 
                                  variant={lead.isRegistered ? "default" : "secondary"} 
                                  className={`text-xs px-2 py-0 ${lead.isRegistered ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                                >
                                  {lead.isRegistered ? '✓ Registriert' : '○ Unregistriert'}
                                </Badge>
                                {/* Current Stage Badge */}
                                {lead.lead_stage && (
                                   <Badge variant="outline" className="text-xs px-2 py-0 bg-blue-50 text-blue-700 border-blue-200">
                                     {lead.lead_stage === 'postident1' && 'PostIdent 1'}
                                     {lead.lead_stage === 'postident2' && 'PostIdent 2'} 
                                     {lead.lead_stage === 'contract' && 'Vertrag'}
                                     {!['postident1', 'postident2', 'contract'].includes(lead.lead_stage) && lead.lead_stage}
                                   </Badge>
                                 )}
                                 {/* Document Upload Badge */}
                                 {lead.hasDocuments && (
                                   <Badge variant="outline" className="text-xs px-2 py-0 bg-purple-50 text-purple-700 border-purple-200">
                                     Bewerbung eingereicht
                                   </Badge>
                                 )}
                              </div>
                            {/* Show contact info on small screens */}
                            <div className="md:hidden space-y-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{lead.email}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span className="truncate">{lead.telefon}</span>
                              </div>
                            </div>
                            {/* Show extra info on very small screens */}
                            <div className="sm:hidden text-xs text-muted-foreground space-y-0.5">
                              {details['Staatsangehörigkeit'] && (
                                <div>🌍 {details['Staatsangehörigkeit']}</div>
                              )}
                              {details['Nettoeinkommen'] && (
                                <div>💰 {details['Nettoeinkommen']} €</div>
                              )}
                              <div>📅 {new Date(lead.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</div>
                              <div>🏠 {lead.property?.title || 'Allgemein'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[140px]">{lead.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              <span className="truncate">{lead.telefon}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-xs text-muted-foreground truncate">
                            {details['Staatsangehörigkeit'] || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-xs text-muted-foreground">
                            {details['Nettoeinkommen'] ? `${details['Nettoeinkommen']}€` : '-'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex flex-col gap-1">
                            <LeadLabelBadge label={lead.lead_label} />
                            <Select
                              value={lead.lead_label ?? 'none'}
                              onValueChange={(v) => updateLabel(lead.id, v === 'none' ? null : v)}
                            >
                               <SelectTrigger className="h-7 text-xs px-2 w-auto min-w-[80px]">
                                 <SelectValue placeholder="Label" />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="none">Ohne Label</SelectItem>
                                 {DEFAULT_LABELS.map(l => (
                                   <SelectItem key={l} value={l}>{l}</SelectItem>
                                 ))}
                               </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            {new Date(lead.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-xs truncate max-w-[100px]">{lead.property?.title || 'Allgemein'}</div>
                        </TableCell>
                        <TableCell>
                           <div className="flex flex-col gap-1">
                             {/* Action Buttons - Compact */}
                             <div className="flex flex-col gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => openDetails(lead)}
                                className="h-7 text-xs px-2"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Details</span>
                              </Button>
                              
                               {/* Always show PostIdent 1 button for all leads */}
                               {(lead.lead_stage !== 'postident1' && lead.lead_stage !== 'postident2') && (
                                 <Button 
                                   size="sm" 
                                   onClick={() => moveToPostIdent1(lead.id)}
                                   className="h-7 text-xs px-2 bg-blue-600 hover:bg-blue-700"
                                 >
                                   <ArrowRight className="h-3 w-3 mr-1" />
                                   <span className="hidden sm:inline">PostIdent 1</span>
                                   <span className="sm:hidden">P1</span>
                                 </Button>
                               )}
                               
                               {/* Show PostIdent 2 button if PostIdent 1 is completed */}
                               {lead.lead_stage === 'postident1' && (
                                 <Button 
                                   size="sm" 
                                   onClick={() => moveToPostIdent2(lead.id)}
                                   className="h-7 text-xs px-2 bg-green-600 hover:bg-green-700"
                                 >
                                   <ArrowRight className="h-3 w-3 mr-1" />
                                   <span className="hidden sm:inline">PostIdent 2</span>
                                   <span className="sm:hidden">P2</span>
                                 </Button>
                               )}
                               
                               {/* Show Contract button if PostIdent 2 is completed */}
                               {lead.lead_stage === 'postident2' && (
                                 <Button 
                                   size="sm" 
                                   onClick={() => moveToContract(lead.id)}
                                   className="h-7 text-xs px-2 bg-purple-600 hover:bg-purple-700"
                                 >
                                   <ArrowRight className="h-3 w-3 mr-1" />
                                   <span className="hidden sm:inline">Vertrag</span>
                                   <span className="sm:hidden">Contract</span>
                                 </Button>
                               )}
                            </div>
                          </div>
                        </TableCell>
                     </TableRow>
                   );
                 })}
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
           
           {/* Pagination */}
           {totalPages > 1 && (
             <div className="mt-6 flex justify-center">
               <Pagination>
                 <PaginationContent>
                   <PaginationItem>
                     <PaginationPrevious 
                       href="#"
                       onClick={(e) => {
                         e.preventDefault();
                         if (currentPage > 1) setCurrentPage(currentPage - 1);
                       }}
                       className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                     />
                   </PaginationItem>
                   
                   {/* Page numbers */}
                   {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                     // Show first page, current page ±1, and last page
                     if (
                       page === 1 || 
                       page === totalPages || 
                       Math.abs(page - currentPage) <= 1
                     ) {
                       return (
                         <PaginationItem key={page}>
                           <PaginationLink
                             href="#"
                             onClick={(e) => {
                               e.preventDefault();
                               setCurrentPage(page);
                             }}
                             isActive={page === currentPage}
                           >
                             {page}
                           </PaginationLink>
                         </PaginationItem>
                       );
                     } else if (page === currentPage - 2 || page === currentPage + 2) {
                       return (
                         <PaginationItem key={page}>
                           <PaginationEllipsis />
                         </PaginationItem>
                       );
                     }
                     return null;
                   })}
                   
                   <PaginationItem>
                     <PaginationNext 
                       href="#"
                       onClick={(e) => {
                         e.preventDefault();
                         if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                       }}
                       className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                     />
                   </PaginationItem>
                 </PaginationContent>
               </Pagination>
             </div>
           )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>Vollständige Informationen zum Lead</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Left Column: Lead Information */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <strong>Name:</strong> 
                        {selected.anrede && (selected.anrede === 'herr' ? 'Herr' : selected.anrede === 'frau' ? 'Frau' : 'Divers')} {selected.vorname} {selected.nachname}
                        {selected.isRegistered && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Registriert
                          </Badge>
                        )}
                      </div>
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
                    <div className="space-y-3 pt-4 border-t">
                      <div><strong>Datum:</strong> {new Date(selected.created_at).toLocaleString('de-DE')}</div>
                      <div><strong>Immobilie:</strong> {selected.property?.title || 'Allgemein'}</div>
                      <div className="flex items-center gap-2"><strong>Label:</strong> <LeadLabelBadge label={selected.lead_label} /></div>
                      {/* Document Upload Badge */}
                      {selected.hasDocuments && (
                        <div className="flex items-center gap-2">
                          <strong>Status:</strong> 
                          <Badge variant="outline" className="text-xs px-2 py-0 bg-purple-50 text-purple-700 border-purple-200">
                            Bewerbung eingereicht
                          </Badge>
                        </div>
                      )}
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
                    
                    {/* Property Applications Section */}
                    {selected.applications && selected.applications.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          📝 Immobilienbewerbungen
                        </h4>
                        <div className="space-y-3">
                          {selected.applications.map((application) => (
                            <div key={application.id} className="bg-muted/50 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="font-medium text-sm">{application.property?.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {application.property?.address}
                                    {application.property?.city && `, ${application.property.city.name}`}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Badge variant="outline" className={`text-xs ${
                                    application.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                    application.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                    application.status === 'under_review' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    'bg-gray-50 text-gray-700 border-gray-200'
                                  }`}>
                                    {application.status === 'pending' && 'Ausstehend'}
                                    {application.status === 'under_review' && 'In Bearbeitung'}
                                    {application.status === 'approved' && 'Genehmigt'}
                                    {application.status === 'rejected' && 'Abgelehnt'}
                                  </Badge>
                                  <Select
                                    value={application.status}
                                    onValueChange={(newStatus) => updateApplicationStatus(application.id, newStatus)}
                                  >
                                    <SelectTrigger className="h-6 text-xs px-2 w-28">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Ausstehend</SelectItem>
                                      <SelectItem value="under_review">In Bearbeitung</SelectItem>
                                      <SelectItem value="approved">Genehmigt</SelectItem>
                                      <SelectItem value="rejected">Abgelehnt</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                                <div>
                                  <span className="font-medium">Bewerbung vom:</span>
                                  <div>{new Date(application.created_at).toLocaleDateString('de-DE')}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Gewünschter Einzug:</span>
                                  <div>{new Date(application.einzugsdatum).toLocaleDateString('de-DE')}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Nettoeinkommen:</span>
                                  <div>{new Intl.NumberFormat('de-DE', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    minimumFractionDigits: 0,
                                  }).format(application.nettoeinkommen)}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Staatsangehörigkeit:</span>
                                  <div>{application.staatsangehoerigkeit}</div>
                                </div>
                              </div>
                              {application.nachricht && (
                                <div className="mt-3 pt-2 border-t">
                                  <span className="font-medium text-xs">Nachricht:</span>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{application.nachricht}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

                {/* Right Column: Documents */}
                <div className="space-y-6">
                  <div className="border-l pl-8 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Hochgeladene Dokumente
                      </h4>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          multiple
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              handleDocumentUpload(Array.from(files));
                              // Reset the input
                              e.target.value = '';
                            }
                          }}
                          className="hidden"
                          id="document-upload"
                          disabled={uploadingDocument}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('document-upload')?.click()}
                          disabled={uploadingDocument}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          {uploadingDocument ? 'Hochladen...' : 'Dokumente hinzufügen'}
                        </Button>
                      </div>
                    </div>
                    
                    {uploadingDocument && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700" />
                          <span className="text-sm">Dokumente werden hochgeladen...</span>
                        </div>
                      </div>
                    )}
                    
                    {!selected.isRegistered ? (
                      <div className="flex items-center justify-center h-32 text-center">
                        <div>
                          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Dieser Lead ist nicht registriert.<br />
                            Keine Dokumente verfügbar.
                          </p>
                        </div>
                      </div>
                    ) : loadingDocuments ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        <p className="ml-3 text-sm text-muted-foreground">Dokumente werden geladen...</p>
                      </div>
                    ) : userDocuments.length === 0 && leadDocuments.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-center">
                        <div>
                          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Keine Dokumente hochgeladen
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                        {/* User Documents Section */}
                        {userDocuments.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-3 text-muted-foreground">Benutzer-Dokumente</h5>
                            <div className="space-y-3">
                              {userDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{getDocumentTypeLabel(doc.document_type)}</div>
                                    <div className="text-sm text-muted-foreground truncate">{doc.file_name}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {new Date(doc.uploaded_at).toLocaleDateString('de-DE', {
                                        day: '2-digit',
                                        month: '2-digit', 
                                        year: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadDocument(doc.file_path, doc.file_name)}
                                    className="ml-3 shrink-0"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Admin Lead Documents Section */}
                        {leadDocuments.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-3 text-muted-foreground">Admin-Dokumente</h5>
                            <div className="space-y-3">
                              {leadDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors border-blue-200 bg-blue-50/50">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{getDocumentTypeLabel(doc.document_type)}</div>
                                    <div className="text-sm text-muted-foreground truncate">{doc.file_name}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Hochgeladen von Admin • {new Date(doc.created_at).toLocaleDateString('de-DE', {
                                        day: '2-digit',
                                        month: '2-digit', 
                                        year: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 ml-3 shrink-0">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => downloadDocument(doc.file_path, doc.file_name)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteLeadDocument(doc.id, doc.file_path)}
                                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
