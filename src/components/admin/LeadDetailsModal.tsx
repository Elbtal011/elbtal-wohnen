import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAPI } from '@/hooks/useAdminAPI';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Mail, Phone, MapPin, User, Building2, Eye, Upload, FileText, Trash2, Edit, Save, X } from 'lucide-react';
import LeadDocumentsSection from './LeadDocumentsSection';

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
  hasDocuments?: boolean;
  geburtsdatum?: string | null;
  geburtsort?: string | null;
}

interface LeadDetailsModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdated: () => void;
}

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  lead,
  open,
  onOpenChange,
  onLeadUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    strasse: '',
    nummer: '',
    plz: '',
    ort: '',
    nettoeinkommen: '',
    geburtsdatum: '',
    geburtsort: ''
  });
  const { callAdminFunction, getPropertyApplicationData } = useAdminAPI();
  const { toast } = useToast();

  useEffect(() => {
    if (lead) {
      const details = extractDetails(lead.nachricht);

      // If applications are preloaded on the lead, prefer them
      const apps: any[] = (lead as any).applications || [];
      if (Array.isArray(apps) && apps.length > 0) {
        const appData = apps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        const addressParts = appData?.adresse ? String(appData.adresse).trim().split(/\s+/) : [];
        let strasse = '', nummer = '';
        if (addressParts.length > 1) {
          nummer = addressParts[addressParts.length - 1];
          strasse = addressParts.slice(0, -1).join(' ');
        } else if (addressParts.length === 1) {
          strasse = addressParts[0];
        }
        setEditForm({
          vorname: lead.vorname || appData?.vorname || '',
          nachname: lead.nachname || appData?.nachname || '',
          email: lead.email || appData?.email || '',
          telefon: lead.telefon || appData?.telefon || '',
          strasse: strasse || lead.strasse || '',
          nummer: nummer || lead.nummer || '',
          plz: appData?.postleitzahl || lead.plz || '',
          ort: appData?.ort || lead.ort || '',
          nettoeinkommen: appData?.nettoeinkommen?.toString() || details['Nettoeinkommen'] || '',
          geburtsdatum: appData?.geburtsdatum || lead.geburtsdatum || details['Geburtsdatum'] || '',
          geburtsort: appData?.geburtsort || lead.geburtsort || details['Geburtsort'] || ''
        });
      } else if ((lead.lead_label || '').toLowerCase().includes('property application') || !lead.strasse) {
        // Otherwise, attempt to fetch by email when it's a property application or address is missing
        fetchPropertyApplicationData();
      } else {
        setEditForm({
          vorname: lead.vorname || '',
          nachname: lead.nachname || '',
          email: lead.email || '',
          telefon: lead.telefon || '',
          strasse: lead.strasse || '',
          nummer: lead.nummer || '',
          plz: lead.plz || '',
          ort: lead.ort || '',
          nettoeinkommen: details['Nettoeinkommen'] || '',
          geburtsdatum: lead.geburtsdatum || details['Geburtsdatum'] || '',
          geburtsort: lead.geburtsort || details['Geburtsort'] || ''
        });
      }
    }
  }, [lead]);

  const fetchPropertyApplicationData = async () => {
    if (!lead) return;
    try {
      const data = await getPropertyApplicationData(lead.email);
      if (data && data.length > 0) {
        const appData = data[0];
        const details = extractDetails(lead.nachricht);
        const addressParts = appData.adresse ? String(appData.adresse).trim().split(/\s+/) : [];
        let strasse = '', nummer = '';
        if (addressParts.length > 1) {
          nummer = addressParts[addressParts.length - 1];
          strasse = addressParts.slice(0, -1).join(' ');
        } else if (addressParts.length === 1) {
          strasse = addressParts[0];
        }
        setEditForm({
          vorname: lead.vorname || appData?.vorname || '',
          nachname: lead.nachname || appData?.nachname || '',
          email: lead.email || appData?.email || '',
          telefon: lead.telefon || appData?.telefon || '',
          strasse: strasse || lead.strasse || '',
          nummer: nummer || lead.nummer || '',
          plz: appData.postleitzahl || lead.plz || '',
          ort: appData.ort || lead.ort || '',
          nettoeinkommen: appData.nettoeinkommen?.toString() || details['Nettoeinkommen'] || '',
          geburtsdatum: appData.geburtsdatum || lead.geburtsdatum || details['Geburtsdatum'] || '',
          geburtsort: appData.geburtsort || lead.geburtsort || details['Geburtsort'] || ''
        });
      }
    } catch (error) {
      console.error('Error fetching property application data:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!lead) return;

    try {
      await callAdminFunction('update_lead', {
        id: lead.id,
        ...editForm
      });

      toast({
        title: 'Erfolgreich',
        description: 'Lead-Daten wurden aktualisiert.'
      });

      setIsEditing(false);
      onLeadUpdated();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

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

  if (!lead) return null;

  const details = extractDetails(lead.nachricht);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Lead Details: {lead.vorname} {lead.nachname}</span>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Abbrechen
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kontaktinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vorname">Vorname</Label>
                      <Input
                        id="vorname"
                        value={editForm.vorname}
                        onChange={(e) => setEditForm(prev => ({ ...prev, vorname: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nachname">Nachname</Label>
                      <Input
                        id="nachname"
                        value={editForm.nachname}
                        onChange={(e) => setEditForm(prev => ({ ...prev, nachname: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefon">Telefon</Label>
                    <Input
                      id="telefon"
                      value={editForm.telefon}
                      onChange={(e) => setEditForm(prev => ({ ...prev, telefon: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="strasse">Straße</Label>
                      <Input
                        id="strasse"
                        value={editForm.strasse}
                        onChange={(e) => setEditForm(prev => ({ ...prev, strasse: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nummer">Nr.</Label>
                      <Input
                        id="nummer"
                        value={editForm.nummer}
                        onChange={(e) => setEditForm(prev => ({ ...prev, nummer: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="plz">PLZ</Label>
                      <Input
                        id="plz"
                        value={editForm.plz}
                        onChange={(e) => setEditForm(prev => ({ ...prev, plz: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ort">Ort</Label>
                    <Input
                      id="ort"
                      value={editForm.ort}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ort: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nettoeinkommen">Nettoeinkommen</Label>
                    <Input
                      id="nettoeinkommen"
                      value={editForm.nettoeinkommen}
                      onChange={(e) => setEditForm(prev => ({ ...prev, nettoeinkommen: e.target.value }))}
                      placeholder="z.B. 2500 €"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="geburtsdatum">Geburtsdatum</Label>
                      <Input
                        id="geburtsdatum"
                        type="date"
                        value={editForm.geburtsdatum}
                        onChange={(e) => setEditForm(prev => ({ ...prev, geburtsdatum: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="geburtsort">Geburtsort</Label>
                      <Input
                        id="geburtsort"
                        value={editForm.geburtsort}
                        onChange={(e) => setEditForm(prev => ({ ...prev, geburtsort: e.target.value }))}
                        placeholder="z.B. München"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{lead.anrede} {lead.vorname} {lead.nachname}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.email}</span>
                    {lead.isRegistered && (
                      <Badge variant="secondary" className="ml-2">Registriert</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.telefon}</span>
                  </div>
                  {(editForm.strasse || editForm.plz || editForm.ort || lead.strasse || lead.plz || lead.ort) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {([editForm.strasse || lead.strasse, editForm.nummer || lead.nummer].filter(Boolean).join(' '))}
                        {([editForm.plz || lead.plz, editForm.ort || lead.ort].filter(Boolean).length > 0 ? ', ' : '')}
                        {([editForm.plz || lead.plz, editForm.ort || lead.ort].filter(Boolean).join(' '))}
                      </span>
                    </div>
                  )}
                  {(lead.geburtsort || details['Geburtsort']) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Geburtsort: {lead.geburtsort || details['Geburtsort']}</span>
                    </div>
                  )}
                  {(lead.geburtsdatum || details['Geburtsdatum']) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Geburtsdatum: {
                        lead.geburtsdatum 
                          ? new Date(lead.geburtsdatum).toLocaleDateString('de-DE')
                          : details['Geburtsdatum']
                      }</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Erstellt: {new Date(lead.created_at).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Property Information */}
          {lead.property && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Immobilie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{lead.property.title}</div>
                    <div className="text-sm text-muted-foreground">{lead.property.address}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message Details */}
          {Object.keys(details).length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Zusätzliche Informationen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(details)
                    .filter(([key]) => key !== 'Geburtsdatum' && key !== 'Geburtsort')
                    .map(([key, value]) => (
                    <div key={key}>
                      <div className="font-medium text-sm text-muted-foreground">{key}</div>
                      <div className="text-sm">{value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Dokumente</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadDocumentsSection 
                lead={lead}
                onDocumentsUpdated={onLeadUpdated}
              />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailsModal;