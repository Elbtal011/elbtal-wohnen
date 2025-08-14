import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, X } from 'lucide-react';

interface ContactFormData {
  vorname: string;
  nachname: string;
  adresse: string;
  plz: string;
  geburtsort: string;
  staatsangehoerigkeit: string;
  geburtsdatum: string;
  nettoeinkommen: string;
  datenschutz: boolean;
  propertyId?: string;
}

interface ContactFormProps {
  propertyId?: string;
  propertyTitle?: string;
  trigger?: React.ReactNode;
  isDialog?: boolean;
  onClose?: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  propertyId, 
  propertyTitle, 
  trigger,
  isDialog = false,
  onClose
}) => {
  const { toast } = useToast();
const [formData, setFormData] = useState<ContactFormData>({
  vorname: '',
  nachname: '',
  adresse: '',
  plz: '',
  geburtsort: '',
  staatsangehoerigkeit: '',
  geburtsdatum: '',
  nettoeinkommen: '',
  datenschutz: false,
  propertyId: propertyId
});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

    setIsSubmitting(true);
    
    try {
      const payload = {
        propertyId: formData.propertyId,
        vorname: formData.vorname,
        nachname: formData.nachname,
        strasse: formData.adresse,
        nummer: '',
        plz: formData.plz,
        ort: '',
        nachricht: `Geburtsort: ${formData.geburtsort}\nStaatsangehörigkeit: ${formData.staatsangehoerigkeit}\nGeburtsdatum: ${formData.geburtsdatum}\nNettoeinkommen: ${formData.nettoeinkommen}`,
        datenschutz: true
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
      
      // Reset form
      setFormData({
        vorname: '',
        nachname: '',
        adresse: '',
        plz: '',
        geburtsort: '',
        staatsangehoerigkeit: '',
        geburtsdatum: '',
        nettoeinkommen: '',
        datenschutz: false,
        propertyId: propertyId
      });

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

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vorname">Vorname *</Label>
          <Input
            id="vorname"
            value={formData.vorname}
            onChange={(e) => handleInputChange('vorname', e.target.value)}
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="nachname">Nachname *</Label>
          <Input
            id="nachname"
            value={formData.nachname}
            onChange={(e) => handleInputChange('nachname', e.target.value)}
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
            value={formData.adresse}
            onChange={(e) => handleInputChange('adresse', e.target.value)}
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="plz">Postleitzahl *</Label>
          <Input
            id="plz"
            value={formData.plz}
            onChange={(e) => handleInputChange('plz', e.target.value)}
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
            value={formData.geburtsort}
            onChange={(e) => handleInputChange('geburtsort', e.target.value)}
            required
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="staatsangehoerigkeit">Staatsangehörigkeit *</Label>
          <Input
            id="staatsangehoerigkeit"
            value={formData.staatsangehoerigkeit}
            onChange={(e) => handleInputChange('staatsangehoerigkeit', e.target.value)}
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
            value={formData.geburtsdatum}
            onChange={(e) => handleInputChange('geburtsdatum', e.target.value)}
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
            value={formData.nettoeinkommen}
            onChange={(e) => handleInputChange('nettoeinkommen', e.target.value)}
            required
            className="mt-2"
          />
        </div>
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
          </DialogHeader>
          <FormContent />
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
        <FormContent />
      </CardContent>
    </Card>
  );
};

export default ContactForm;