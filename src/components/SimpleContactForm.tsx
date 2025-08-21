import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send } from 'lucide-react';

interface SimpleContactFormProps {
  propertyId?: string;
  propertyTitle?: string;
  trigger?: React.ReactNode;
  isDialog?: boolean;
  onClose?: () => void;
}

const SimpleContactForm: React.FC<SimpleContactFormProps> = ({ 
  propertyId, 
  propertyTitle, 
  trigger,
  isDialog = false,
  onClose
}) => {
  const { toast } = useToast();
  
// Pflichtfelder laut Anforderung
const [vorname, setVorname] = useState('');
const [nachname, setNachname] = useState('');
const [email, setEmail] = useState('');
const [telefon, setTelefon] = useState('');
const [adresse, setAdresse] = useState('');
const [plz, setPlz] = useState('');
const [geburtsort, setGeburtsort] = useState('');
const [staatsangehoerigkeit, setStaatsangehoerigkeit] = useState('');
const [geburtsdatum, setGeburtsdatum] = useState('');
const [einzugsdatum, setEinzugsdatum] = useState('');
const [nettoeinkommen, setNettoeinkommen] = useState('');
const [deineNachricht, setDeineNachricht] = useState('');

const [datenschutz, setDatenschutz] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [open, setOpen] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();


  setIsSubmitting(true);

  try {
    const payload = {
      propertyId,
      vorname,
      nachname,
      email,
      telefon,
      strasse: adresse,
      nummer: '',
      plz,
      ort: '',
      nachricht: `${deineNachricht}\n\nGeburtsort: ${geburtsort}\nStaatsangehörigkeit: ${staatsangehoerigkeit}\nGeburtsdatum: ${geburtsdatum}${isDialog ? `\nEinzugsdatum: ${einzugsdatum}` : ''}\nNettoeinkommen: ${nettoeinkommen}`,
      datenschutz: true,
      formSource: isDialog ? 'property_details' : 'contact_page'
    };

    const { data, error } = await supabase.functions.invoke('contact-submit', {
      body: payload
    });

    if (error || (data && (data as any).error)) {
      throw new Error((data as any)?.error || 'Submission failed');
    }

    toast({
      title: "Nachricht gesendet!",
      description: "Vielen Dank für Ihre Anfrage. Wir melden uns in Kürze bei Ihnen.",
    });

    // Reset
    setVorname('');
    setNachname('');
    setEmail('');
    setTelefon('');
    setAdresse('');
    setPlz('');
    setGeburtsort('');
    setStaatsangehoerigkeit('');
    setGeburtsdatum('');
    if (isDialog) setEinzugsdatum('');
    setNettoeinkommen('');
    setDeineNachricht('');
    setDatenschutz(false);

    if (isDialog) {
      setOpen(false);
      onClose?.();
    }
  } catch (error) {
    toast({
      title: "Fehler",
      description: "Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es erneut.",
      variant: "destructive"
    });
  } finally {
    setIsSubmitting(false);
  }
};

  // Direct JSX without memoization
  const formJsx = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vorname">Vorname *</Label>
          <Input
            id="vorname"
            value={vorname}
            onChange={(e) => setVorname(e.target.value)}
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="nachname">Nachname *</Label>
          <Input
            id="nachname"
            value={nachname}
            onChange={(e) => setNachname(e.target.value)}
            required
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">E-Mail Adresse *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="telefon">Telefonnummer *</Label>
          <Input
            id="telefon"
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            required
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="adresse">Adresse *</Label>
          <Input
            id="adresse"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="plz">Postleitzahl *</Label>
          <Input
            id="plz"
            value={plz}
            onChange={(e) => setPlz(e.target.value)}
            required
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="geburtsort">Geburtsort *</Label>
          <Input
            id="geburtsort"
            value={geburtsort}
            onChange={(e) => setGeburtsort(e.target.value)}
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="staatsangehoerigkeit">Staatsangehörigkeit *</Label>
          <Input
            id="staatsangehoerigkeit"
            value={staatsangehoerigkeit}
            onChange={(e) => setStaatsangehoerigkeit(e.target.value)}
            required
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="geburtsdatum">Geburtsdatum *</Label>
          <Input
            id="geburtsdatum"
            type="date"
            value={geburtsdatum}
            onChange={(e) => setGeburtsdatum(e.target.value)}
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="nettoeinkommen">Nettoeinkommen (€/Monat) *</Label>
          <Input
            id="nettoeinkommen"
            type="number"
            min={0}
            step="1"
            value={nettoeinkommen}
            onChange={(e) => setNettoeinkommen(e.target.value)}
            required
            className="mt-2"
          />
        </div>
      </div>

      {isDialog && (
        <div>
          <Label htmlFor="einzugsdatum">Einzugsdatum *</Label>
          <Input
            id="einzugsdatum"
            type="date"
            value={einzugsdatum}
            onChange={(e) => setEinzugsdatum(e.target.value)}
            required
            className="mt-2"
          />
        </div>
      )}

      <div>
        <Label htmlFor="deineNachricht">Deine Nachricht *</Label>
        <Textarea
          id="deineNachricht"
          value={deineNachricht}
          onChange={(e) => setDeineNachricht(e.target.value)}
          required
          placeholder="Beschreiben Sie Ihr Anliegen..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div className="text-sm leading-relaxed">
        Mit dem Absenden der Anfrage erkläre ich mich damit einverstanden, dass meine angegebenen personenbezogenen Daten gemäß der Datenschutzerklärung verarbeitet und zum Zweck der Bearbeitung meiner Anfrage gespeichert werden.
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          "Wird gesendet..."
        ) : (
          "Anfrage senden"
        )}
      </Button>
    </form>
  );

  if (isDialog && trigger) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {propertyTitle ? `Interesse an: ${propertyTitle}` : 'Kontakt aufnehmen'}
            </DialogTitle>
            <DialogDescription>
              Füllen Sie das Formular aus und wir melden uns schnellstmöglich bei Ihnen.
            </DialogDescription>
          </DialogHeader>
          {formJsx}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Kontaktformular
        </CardTitle>
        <p className="text-muted-foreground">
          Füllen Sie das Formular aus und wir melden uns schnellstmöglich bei Ihnen.
        </p>
      </CardHeader>
      <CardContent>
        {formJsx}
      </CardContent>
    </Card>
  );
};

export default SimpleContactForm;