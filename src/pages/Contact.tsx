import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import ContactForm from '@/components/SimpleContactForm';
import { Phone, Mail, MapPin, Clock, Building, HeartHandshake } from 'lucide-react';
const Contact = () => {
  const contactInfo = [{
    icon: Phone,
    title: "Telefon",
    details: ["+49 089 244 108 610"],
    description: "Mo-Fr: 9:00-18:00 Uhr, Sa: 9:00-14:00 Uhr"
  }, {
    icon: Mail,
    title: "E-Mail",
    details: ["info@amiel-immobilienverwaltung.de"],
    description: "Wir antworten innerhalb von 24 Stunden"
  }, {
    icon: MapPin,
    title: "Adresse",
    details: ["Leuchtenbergring 54", "81677 München"],
    description: "Direkt im Stadtzentrum gelegen"
  }, {
    icon: Building,
    title: "Bürozeiten",
    details: ["Montag - Freitag: 9:00 - 18:00", "Samstag: 9:00 - 14:00"],
    description: "Termine nach Vereinbarung möglich"
  }];
  const services = ["Immobilienvermietung", "Hausverwaltung", "Immobilienbewertung", "Finanzierungsberatung", "Mietrechtsberatung", "Energieberatung"];
  return <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary">
            Kontakt
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Nehmen Sie Kontakt mit uns auf
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Haben Sie Fragen zu unseren Immobilien oder Services? Wir sind gerne für Sie da 
            und beraten Sie kompetent und persönlich.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="order-2 lg:order-1">
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Contact Details */}
            {contactInfo.map((info, index) => <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                      {info.details.map((detail, idx) => <p key={idx} className="text-foreground font-medium">
                          {detail}
                        </p>)}
                      <p className="text-muted-foreground text-sm mt-1">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>)}


            {/* CTA Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartHandshake className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Persönliche Beratung</h3>
                <p className="mb-4 text-muted-foreground">
                  Vereinbaren Sie einen Termin für eine kostenlose Beratung vor Ort.
                </p>
                <Button variant="default" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Termin vereinbaren
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>;
};
export default Contact;