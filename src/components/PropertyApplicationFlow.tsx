import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PropertyApplicationFlowProps {
  propertyId: string;
  propertyTitle: string;
  trigger: React.ReactNode;
}

interface FormData {
  // Step 1 - Personal Information
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  adresse: string;
  postleitzahl: string;
  ort: string;
  geburtsort: string;
  staatsangehoerigkeit: string;
  geburtsdatum: Date | undefined;
  
  // Step 2 - Financial and Move-in
  nettoeinkommen: string;
  einzugsdatum: Date | undefined;
  nachricht: string;
}

const PropertyApplicationFlow = ({ propertyId, propertyTitle, trigger }: PropertyApplicationFlowProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    vorname: '',
    nachname: '',
    email: user?.email || '',
    telefon: '',
    adresse: '',
    postleitzahl: '',
    ort: '',
    geburtsort: '',
    staatsangehoerigkeit: '',
    geburtsdatum: undefined,
    nettoeinkommen: '',
    einzugsdatum: undefined,
    nachricht: '',
  });

  const handleInputChange = (field: keyof FormData, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    const required = [
      'vorname', 'nachname', 'email', 'telefon', 'adresse', 
      'postleitzahl', 'ort', 'geburtsort', 'staatsangehoerigkeit'
    ];
    
    for (const field of required) {
      if (!formData[field as keyof FormData]) {
        toast.error(`Bitte füllen Sie das Feld "${field}" aus`);
        return false;
      }
    }
    
    if (!formData.geburtsdatum) {
      toast.error('Bitte wählen Sie Ihr Geburtsdatum');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!formData.nettoeinkommen) {
      toast.error('Bitte geben Sie Ihr Nettoeinkommen an');
      return false;
    }
    
    if (!formData.einzugsdatum) {
      toast.error('Bitte wählen Sie Ihr gewünschtes Einzugsdatum');
      return false;
    }
    
    if (!formData.nachricht || formData.nachricht.length < 10) {
      toast.error('Bitte geben Sie eine Nachricht mit mindestens 10 Zeichen ein');
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    if (!user) {
      toast.error('Sie müssen angemeldet sein, um eine Bewerbung abzusenden');
      return;
    }

    setLoading(true);
    
    try {
      const applicationData = {
        user_id: user.id,
        property_id: propertyId,
        vorname: formData.vorname,
        nachname: formData.nachname,
        email: formData.email,
        telefon: formData.telefon,
        adresse: formData.adresse,
        postleitzahl: formData.postleitzahl,
        ort: formData.ort,
        geburtsort: formData.geburtsort,
        staatsangehoerigkeit: formData.staatsangehoerigkeit,
        geburtsdatum: formData.geburtsdatum!.toISOString().split('T')[0],
        nettoeinkommen: parseInt(formData.nettoeinkommen),
        einzugsdatum: formData.einzugsdatum!.toISOString().split('T')[0],
        nachricht: formData.nachricht,
        status: 'pending'
      };

      const { error } = await supabase
        .from('property_applications')
        .insert(applicationData);

      if (error) throw error;

      toast.success('Ihre Bewerbung wurde erfolgreich eingereicht!');
      setOpen(false);
      setCurrentStep(1);
      
      // Reset form
      setFormData({
        vorname: '',
        nachname: '',
        email: user?.email || '',
        telefon: '',
        adresse: '',
        postleitzahl: '',
        ort: '',
        geburtsort: '',
        staatsangehoerigkeit: '',
        geburtsdatum: undefined,
        nettoeinkommen: '',
        einzugsdatum: undefined,
        nachricht: '',
      });
      
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Fehler beim Einreichen der Bewerbung');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vorname">Vorname *</Label>
          <Input
            id="vorname"
            value={formData.vorname}
            onChange={(e) => handleInputChange('vorname', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="nachname">Nachname *</Label>
          <Input
            id="nachname"
            value={formData.nachname}
            onChange={(e) => handleInputChange('nachname', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">E-Mail Adresse *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="telefon">Telefonnummer *</Label>
        <Input
          id="telefon"
          type="tel"
          value={formData.telefon}
          onChange={(e) => handleInputChange('telefon', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="adresse">Adresse *</Label>
        <Input
          id="adresse"
          value={formData.adresse}
          onChange={(e) => handleInputChange('adresse', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postleitzahl">Postleitzahl *</Label>
          <Input
            id="postleitzahl"
            value={formData.postleitzahl}
            onChange={(e) => handleInputChange('postleitzahl', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="ort">Ort *</Label>
          <Input
            id="ort"
            value={formData.ort}
            onChange={(e) => handleInputChange('ort', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="geburtsort">Geburtsort *</Label>
        <Input
          id="geburtsort"
          value={formData.geburtsort}
          onChange={(e) => handleInputChange('geburtsort', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="staatsangehoerigkeit">Staatsangehörigkeit *</Label>
        <Input
          id="staatsangehoerigkeit"
          value={formData.staatsangehoerigkeit}
          onChange={(e) => handleInputChange('staatsangehoerigkeit', e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Geburtsdatum *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.geburtsdatum && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.geburtsdatum ? (
                format(formData.geburtsdatum, "dd.MM.yyyy", { locale: de })
              ) : (
                <span>Datum wählen</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.geburtsdatum}
              onSelect={(date) => handleInputChange('geburtsdatum', date)}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nettoeinkommen">Nettoeinkommen (€) *</Label>
        <Input
          id="nettoeinkommen"
          type="number"
          value={formData.nettoeinkommen}
          onChange={(e) => handleInputChange('nettoeinkommen', e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Gewünschtes Einzugsdatum *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.einzugsdatum && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.einzugsdatum ? (
                format(formData.einzugsdatum, "dd.MM.yyyy", { locale: de })
              ) : (
                <span>Datum wählen</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.einzugsdatum}
              onSelect={(date) => handleInputChange('einzugsdatum', date)}
              disabled={(date) => date < new Date()}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="nachricht">Ihre Nachricht *</Label>
        <Textarea
          id="nachricht"
          value={formData.nachricht}
          onChange={(e) => handleInputChange('nachricht', e.target.value)}
          placeholder="Erzählen Sie uns etwas über sich und warum Sie sich für diese Immobilie interessieren..."
          rows={4}
          required
        />
        <p className="text-sm text-muted-foreground mt-1">
          Mindestens 10 Zeichen
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Bewerbung für: {propertyTitle}
          </DialogTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span className={currentStep === 1 ? 'font-medium text-primary' : ''}>
              1. Persönliche Daten
            </span>
            <span>→</span>
            <span className={currentStep === 2 ? 'font-medium text-primary' : ''}>
              2. Einkommen & Einzug
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}

          <div className="flex justify-between">
            {currentStep === 2 && (
              <Button variant="outline" onClick={handlePrevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
            )}
            
            <div className="ml-auto">
              {currentStep === 1 && (
                <Button onClick={handleNextStep}>
                  Weiter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              
              {currentStep === 2 && (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Wird eingereicht...' : 'Bewerbung absenden'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyApplicationFlow;