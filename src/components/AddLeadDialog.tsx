import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, FileText } from 'lucide-react';

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableLabels: string[];
  onCreated?: () => void;
}

const ANREDE = [
  { value: 'herr', label: 'Herr' },
  { value: 'frau', label: 'Frau' },
  { value: 'divers', label: 'Divers' },
];

const AddLeadDialog: React.FC<AddLeadDialogProps> = ({ open, onOpenChange, availableLabels, onCreated }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [anrede, setAnrede] = useState<string | undefined>();
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [strasse, setStrasse] = useState('');
  const [nummer, setNummer] = useState('');
  const [plz, setPlz] = useState('');
  const [ort, setOrt] = useState('');
  const [geburtsort, setGeburtsort] = useState('');
  const [staatsangehoerigkeit, setStaatsangehoerigkeit] = useState('');
  const [geburtsdatum, setGeburtsdatum] = useState(''); // yyyy-mm-dd
  const [einzugsdatum, setEinzugsdatum] = useState(''); // yyyy-mm-dd
  const [nettoeinkommen, setNettoeinkommen] = useState('');
  const [leadLabel, setLeadLabel] = useState<string>('none');
  const [freieNachricht, setFreieNachricht] = useState('');
  const [deineNachricht, setDeineNachricht] = useState('');
  const [iban, setIban] = useState('');
  const [amount, setAmount] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);

  const labels = useMemo(() => Array.from(new Set(availableLabels)), [availableLabels]);

  const reset = () => {
    setAnrede(undefined);
    setVorname('');
    setNachname('');
    setEmail('');
    setTelefon('');
    setStrasse('');
    setNummer('');
    setPlz('');
    setOrt('');
    setGeburtsort('');
    setStaatsangehoerigkeit('');
    setGeburtsdatum('');
    setEinzugsdatum('');
    setNettoeinkommen('');
    setLeadLabel('none');
    setFreieNachricht('');
    setDeineNachricht('');
    setIban('');
    setAmount('');
    setDocuments([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    const validFiles = files.filter(file => validTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      toast({
        title: 'Ungültige Dateitypen',
        description: 'Nur PNG, JPG und PDF Dateien sind erlaubt.',
        variant: 'destructive'
      });
    }
    
    setDocuments(prev => [...prev, ...validFiles]);
    e.target.value = '';
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadDocuments = async (contactRequestId: string) => {
    const uploadedDocs = [];
    
    for (const file of documents) {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${contactRequestId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('lead-documents')
        .upload(filePath, file);
        
      if (error) {
        console.error('Upload error:', error);
        continue;
      }
      
      const { error: dbError } = await supabase
        .from('lead_documents')
        .insert({
          contact_request_id: contactRequestId,
          document_type: file.type.includes('pdf') ? 'other' : 'id',
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          content_type: file.type
        });
        
      if (dbError) {
        console.error('DB insert error:', dbError);
      } else {
        uploadedDocs.push(file.name);
      }
    }
    
    return uploadedDocs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Kein Admin-Token gefunden');

      const combinedNachricht = `${deineNachricht}\n\nGeburtsort: ${geburtsort}\nStaatsangehörigkeit: ${staatsangehoerigkeit}\nGeburtsdatum: ${geburtsdatum}\nEinzugsdatum: ${einzugsdatum}\nNettoeinkommen: ${nettoeinkommen}${iban ? `\nIBAN: ${iban}` : ''}${amount ? `\nBetrag: ${amount}€` : ''}${freieNachricht ? `\n\n${freieNachricht}` : ''}`;

      const payload = {
        action: 'create_contact_request',
        token,
        anrede,
        vorname,
        nachname,
        email,
        telefon,
        nachricht: combinedNachricht,
        strasse: strasse || null,
        nummer: nummer || null,
        plz: plz || null,
        ort: ort || null,
        lead_label: leadLabel === 'none' ? null : leadLabel,
      };

      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: payload,
      });
      if (error) throw error;

      // Upload documents if any
      if (documents.length > 0 && data?.contact_request_id) {
        const uploadedDocs = await uploadDocuments(data.contact_request_id);
        if (uploadedDocs.length > 0) {
          toast({
            title: 'Lead und Dokumente erstellt',
            description: `${vorname} ${nachname} wurde hinzugefügt mit ${uploadedDocs.length} Dokumenten.`
          });
        } else {
          toast({
            title: 'Lead erstellt',
            description: `${vorname} ${nachname} wurde hinzugefügt, aber Dokumente konnten nicht hochgeladen werden.`,
            variant: 'destructive'
          });
        }
      } else {
        toast({ title: 'Lead erstellt', description: `${vorname} ${nachname} wurde hinzugefügt.` });
      }
      
      onOpenChange(false);
      reset();
      onCreated?.();
    } catch (err: any) {
      console.error('Create lead error:', err);
      toast({ title: 'Fehler', description: err.message || 'Lead konnte nicht erstellt werden.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Lead hinzufügen</DialogTitle>
          <DialogDescription>Füge einen neuen Lead manuell hinzu.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Anrede</label>
              <Select value={anrede ?? 'none'} onValueChange={(v) => setAnrede(v === 'none' ? undefined : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Anrede" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine</SelectItem>
                  {ANREDE.map(a => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Vorname *</label>
              <Input value={vorname} onChange={(e) => setVorname(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nachname *</label>
              <Input value={nachname} onChange={(e) => setNachname(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">E-Mail *</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Telefon *</label>
              <Input value={telefon} onChange={(e) => setTelefon(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Label</label>
              <Select value={leadLabel} onValueChange={setLeadLabel}>
                <SelectTrigger>
                  <SelectValue placeholder="Label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ohne Label</SelectItem>
                  {labels.map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Straße</label>
              <Input value={strasse} onChange={(e) => setStrasse(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nr.</label>
              <Input value={nummer} onChange={(e) => setNummer(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">PLZ</label>
              <Input value={plz} onChange={(e) => setPlz(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ort</label>
              <Input value={ort} onChange={(e) => setOrt(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Geburtsort *</label>
              <Input value={geburtsort} onChange={(e) => setGeburtsort(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Staatsangehörigkeit *</label>
              <Input value={staatsangehoerigkeit} onChange={(e) => setStaatsangehoerigkeit(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Geburtsdatum *</label>
              <Input type="date" value={geburtsdatum} onChange={(e) => setGeburtsdatum(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Einzugsdatum *</label>
              <Input type="date" value={einzugsdatum} onChange={(e) => setEinzugsdatum(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nettoeinkommen (€/Monat) *</label>
              <Input type="number" min={0} step="1" value={nettoeinkommen} onChange={(e) => setNettoeinkommen(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">IBAN</label>
              <Input value={iban} onChange={(e) => setIban(e.target.value)} placeholder="DE89 3704 0044 0532 0130 00" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Betrag (€)</label>
              <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Deine Nachricht *</label>
            <Textarea placeholder="Beschreiben Sie Ihr Anliegen..." value={deineNachricht} onChange={(e) => setDeineNachricht(e.target.value)} rows={4} required />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Freitext (optional)</label>
            <Textarea placeholder="Zusätzliche Informationen..." value={freieNachricht} onChange={(e) => setFreieNachricht(e.target.value)} rows={3} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dokumente hochladen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-sm text-gray-600 mb-2">
                  Klicken Sie hier oder ziehen Sie Dateien hierher
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  Unterstützte Formate: PNG, JPG, PDF (max. 10MB pro Datei)
                </div>
                <input
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="document-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('document-upload')?.click()}
                >
                  Dateien auswählen
                </Button>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Ausgewählte Dateien ({documents.length})</h4>
                  {documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium">{file.name}</div>
                          <div className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Abbrechen</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Speichern…' : 'Speichern'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadDialog;
