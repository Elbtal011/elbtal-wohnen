import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Search, 
  FileText, 
  Calculator, 
  Users, 
  Wrench, 
  Shield, 
  Phone,
  Mail,
  Clock,
  Star,
  CheckCircle,
  Zap,
  Calendar,
  MapPin,
  HeartHandshake,
  Building,
  Key,
  Settings,
  TrendingUp
} from 'lucide-react';

const Leistungsübersicht = () => {
  const mainServices = [
    {
      icon: Home,
      title: "Immobilienvermietung",
      description: "Professionelle Vermietung von Wohn- und Gewerbeimmobilien",
      features: [
        "Marktgerechte Mietpreisermittlung",
        "Professionelle Objektpräsentation", 
        "Mieterauswahl und Bonitätsprüfung",
        "Vertragsgestaltung und -abwicklung"
      ]
    },
    {
      icon: Building,
      title: "Hausverwaltung",
      description: "Umfassende Verwaltung Ihrer Immobilie mit allen technischen und kaufmännischen Aufgaben",
      features: [
        "Technische Gebäudeverwaltung",
        "Kaufmännische Verwaltung",
        "Nebenkostenabrechnung",
        "Instandhaltungsmanagement"
      ]
    },
    {
      icon: Search,
      title: "Immobilienbewertung",
      description: "Professionelle Wertermittlung für Kauf, Verkauf oder Versicherung",
      features: [
        "Marktwertgutachten",
        "Beleihungswertgutachten",
        "Versicherungswertgutachten",
        "Erbschafts- und Scheidungsgutachten"
      ]
    },
    {
      icon: Calculator,
      title: "Immobilienfinanzierung", 
      description: "Beratung und Vermittlung passender Finanzierungslösungen",
      features: [
        "Finanzierungsberatung",
        "Konditionsvergleich",
        "Fördermittelberatung",
        "Antragsbegleitung"
      ]
    }
  ];

  const additionalServices = [
    {
      icon: Wrench,
      title: "Instandhaltung & Modernisierung",
      description: "Koordination und Überwachung aller Instandhaltungsmaßnahmen"
    },
    {
      icon: FileText,
      title: "Mietrechtsberatung",
      description: "Rechtssichere Beratung in allen mietrechtlichen Angelegenheiten"
    },
    {
      icon: Shield,
      title: "Versicherungsmanagement", 
      description: "Optimierung und Verwaltung aller immobilienbezogenen Versicherungen"
    },
    {
      icon: Key,
      title: "Schlüsselservice",
      description: "Professioneller Schlüsseldienst und Zugangsverwaltung"
    },
    {
      icon: Settings,
      title: "Energieberatung",
      description: "Beratung zur Energieeffizienz und Sanierungsmaßnahmen"
    },
    {
      icon: TrendingUp,
      title: "Portfolioanalyse", 
      description: "Strategische Analyse und Optimierung Ihres Immobilienportfolios"
    }
  ];

  const processSteps = [
    {
      number: 1,
      title: "Erstberatung",
      description: "Kostenlose und unverbindliche Beratung zu Ihren Immobilienwünschen"
    },
    {
      number: 2, 
      title: "Bedarfsanalyse",
      description: "Detaillierte Analyse Ihrer Anforderungen und Ziele"
    },
    {
      number: 3,
      title: "Maßgeschneidertes Angebot", 
      description: "Individuell auf Sie zugeschnittene Leistungspakete"
    },
    {
      number: 4,
      title: "Professionelle Umsetzung",
      description: "Zuverlässige und fachkundige Durchführung aller vereinbarten Leistungen"
    }
  ];

  const advantages = [
    {
      icon: Star,
      title: "35+ Jahre Erfahrung",
      description: "Seit 1988 erfolgreich am Markt"
    },
    {
      icon: Users,
      title: "Persönlicher Service", 
      description: "Ihr fester Ansprechpartner für alle Anliegen"
    },
    {
      icon: MapPin,
      title: "Lokale Expertise",
      description: "Tiefgreifende Marktkenntnis in der Region"
    },
    {
      icon: Clock,
      title: "Schnelle Reaktionszeiten",
      description: "Rückmeldung binnen 24 Stunden"
    },
    {
      icon: Shield,
      title: "Rechtssicherheit",
      description: "Alle Verträge und Prozesse rechtlich abgesichert"
    },
    {
      icon: Zap,
      title: "Modernste Technik",
      description: "Digitale Prozesse für maximale Effizienz"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary">
            Leistungsübersicht
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Unsere Services für Sie
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Seit über 35 Jahren bieten wir umfassende Immobiliendienstleistungen 
            mit höchster Professionalität und persönlichem Service.
          </p>
        </div>

        {/* Main Services */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Unsere Hauptleistungen</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {mainServices.map((service, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <service.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Services */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Weitere Dienstleistungen</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalServices.map((service, index) => (
              <Card key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <service.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">So arbeiten wir</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Advantages */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Warum Elbtal Immobilienverwaltung?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <Card key={index} className="text-center p-6 border-2 hover:border-primary/20 transition-colors">
                <advantage.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{advantage.title}</h3>
                <p className="text-muted-foreground text-sm">{advantage.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Info */}
        <Card className="mb-20 bg-muted/50">
          <CardContent className="text-center p-12">
            <Calculator className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Transparente Preisgestaltung</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Unsere Preise sind fair, transparent und orientieren sich an der erbrachten Leistung. 
              Versteckte Kosten gibt es bei uns nicht.
            </p>
            <Button size="lg">
              <FileText className="h-5 w-5 mr-2" />
              Kostenlose Beratung vereinbaren
            </Button>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="text-center p-12">
            <HeartHandshake className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Lassen Sie uns über Ihre Immobilie sprechen</h2>
            <p className="text-xl mb-8 opacity-90">
              Kontaktieren Sie uns für eine kostenlose und unverbindliche Beratung zu unseren Services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <Phone className="h-5 w-5 mr-2" />
                +49 123 456 789
              </Button>
              <Button size="lg" variant="secondary">
                <Mail className="h-5 w-5 mr-2" />
                info@elbtal-immobilien.de
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Leistungsübersicht;