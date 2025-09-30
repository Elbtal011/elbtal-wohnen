import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, CheckCircle, Key, Clock, Users, Shield, Phone, Mail, Calendar, Home, HeartHandshake } from 'lucide-react';
const Vermietungsablauf = () => {
  const steps = [{
    number: 1,
    title: "Erste Kontaktaufnahme",
    icon: Phone,
    description: "Sie kontaktieren uns telefonisch, per E-Mail oder über unser Kontaktformular.",
    details: ["Kostenlose Erstberatung", "Bedarfsanalyse Ihrer Wohnwünsche", "Terminvereinbarung für Besichtigungen"]
  }, {
    number: 2,
    title: "Objektauswahl",
    icon: Search,
    description: "Gemeinsam finden wir die passende Immobilie für Ihre Bedürfnisse.",
    details: ["Präsentation geeigneter Objekte", "Detaillierte Objektinformationen", "Terminkoordination für Besichtigungen"]
  }, {
    number: 3,
    title: "Besichtigung",
    icon: Home,
    description: "Persönliche Besichtigung der ausgewählten Immobilien mit unseren Experten.",
    details: ["Fachkundige Objektführung", "Beantwortung aller Fragen", "Aufzeigen von Besonderheiten"]
  }, {
    number: 4,
    title: "Bewerbungsunterlagen",
    icon: FileText,
    description: "Zusammenstellung der erforderlichen Unterlagen für Ihre Bewerbung.",
    details: ["Selbstauskunft", "Einkommensnachweise", "SCHUFA-Auskunft", "Mietschuldenfreiheitsbescheinigung"]
  }, {
    number: 5,
    title: "Prüfung & Zusage",
    icon: CheckCircle,
    description: "Wir prüfen Ihre Unterlagen und geben Ihnen schnellstmöglich eine Rückmeldung.",
    details: ["Bonitätsprüfung", "Referenzprüfung", "Entscheidung binnen 48 Stunden"]
  }, {
    number: 6,
    title: "Vertragsabschluss",
    icon: FileText,
    description: "Bei positiver Prüfung erfolgt die Vertragsunterzeichnung.",
    details: ["Mietvertragserstellung", "Vertragsberatung", "Kautionsabwicklung"]
  }];
  const requiredDocuments = ["Ausgefüllte Selbstauskunft", "Einkommensnachweise der letzten 3 Monate", "Arbeitsvertrag oder Beschäftigungsnachweis", "SCHUFA-Auskunft (nicht älter als 3 Monate)", "Mietschuldenfreiheitsbescheinigung", "Personalausweis oder Reisepass", "Bei Selbstständigen: BWA und Steuerbescheid"];
  return <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Ihr Weg ins neue Zuhause</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Von der ersten Anfrage bis zur Schlüsselübergabe – wir stehen Ihnen während des gesamten Vermietungsprozesses kompetent zur Seite.</p>
        </div>

        {/* Process Steps */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Der Vermietungsablauf in 7 Schritten</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => <Card key={step.number} className="relative overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    {/* Step Number and Title */}
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {step.number}. {step.title}
                      </h3>
                    </div>
                    
                    {/* Content */}
                    <div>
                      <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                        {step.description}
                      </p>
                      
                      <div className="space-y-2">
                        {step.details.map((detail, idx) => <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-muted-foreground">{detail}</span>
                          </div>)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* Required Documents */}
        <div className="mb-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Erforderliche Unterlagen</CardTitle>
              <p className="text-muted-foreground">
                Diese Dokumente benötigen wir für Ihre Bewerbung
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {requiredDocuments.map((doc, index) => <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{doc}</span>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Highlights */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Unser Service für Sie</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-black mb-4" />
                <CardTitle>Schnelle Bearbeitung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Rückmeldung zu Ihrer Bewerbung binnen 48 Stunden nach 
                  Eingang aller erforderlichen Unterlagen.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-black mb-4" />
                <CardTitle>Persönliche Betreuung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ihr persönlicher Ansprechpartner begleitet Sie durch 
                  den gesamten Vermietungsprozess.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-black mb-4" />
                <CardTitle>Sicherheit & Transparenz</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Faire Verträge, transparente Kosten und sichere 
                  Abwicklung aller Formalitäten.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact CTA */}
        <Card className="border">
          <CardContent className="text-center p-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Bereit für Ihre neue Wohnung?</h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Kontaktieren Sie uns noch heute und starten Sie Ihren Weg zur Traumwohnung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="bg-white hover:bg-primary hover:text-white">
                +49 089 244 108 610
              </Button>
              <Button size="lg" variant="outline" className="bg-white hover:bg-primary hover:text-white">
                info@amiel-immobilienverwaltung.de
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>;
};
export default Vermietungsablauf;