import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Users, Award, Target, Heart, Shield, TrendingUp, Clock, Star, CheckCircle, Phone, Mail, Calendar, MapPin, HeartHandshake, Lightbulb, Handshake, Home, Trophy } from 'lucide-react';
const Unternehmen = () => {
  const milestones = [{
    year: "1988",
    title: "Gründung in München",
    description: "Start als kleine Immobilienverwaltung mit Fokus auf persönlichen Service"
  }, {
    year: "1995",
    title: "Erste Expansion",
    description: "Erweiterung des Portfolios auf über 500 verwaltete Einheiten"
  }, {
    year: "2005",
    title: "Modernisierung",
    description: "Einführung digitaler Verwaltungssysteme und Online-Services"
  }, {
    year: "2015",
    title: "Regionale Expansion",
    description: "Ausweitung der Services auf ganz Sachsen und angrenzende Regionen"
  }, {
    year: "2020",
    title: "Digitale Transformation",
    description: "Vollständige Digitalisierung aller Prozesse und Launch der Online-Plattform"
  }, {
    year: "2025",
    title: "37 Jahre Erfahrung",
    description: "Über 2.000 verwaltete Einheiten und 10.000 zufriedene Kunden"
  }];
  const values = [{
    icon: Heart,
    title: "Kundenorientierung",
    description: "Ihre Zufriedenheit steht im Mittelpunkt unseres Handelns. Wir hören zu und finden maßgeschneiderte Lösungen."
  }, {
    icon: Shield,
    title: "Vertrauen & Zuverlässigkeit",
    description: "Über 35 Jahre Erfahrung sprechen für sich. Auf uns können Sie sich verlassen."
  }, {
    icon: Lightbulb,
    title: "Innovation",
    description: "Wir nutzen modernste Technologien, um Ihnen den bestmöglichen Service zu bieten."
  }, {
    icon: Handshake,
    title: "Partnerschaftlichkeit",
    description: "Wir sehen uns als Ihr langfristiger Partner, nicht nur als Dienstleister."
  }, {
    icon: Target,
    title: "Qualität",
    description: "Höchste Standards in allen Bereichen - von der Beratung bis zur Ausführung."
  }, {
    icon: Users,
    title: "Teamgeist",
    description: "Unser erfahrenes Team arbeitet Hand in Hand für Ihren Erfolg."
  }];
  const team = [{
    name: "Dr. Michael Schmidt",
    position: "Geschäftsführer",
    experience: "25 Jahre Erfahrung",
    specialization: "Immobilienrecht & Unternehmensstrategie"
  }, {
    name: "Sarah Müller",
    position: "Leiterin Hausverwaltung",
    experience: "18 Jahre Erfahrung",
    specialization: "Technische & kaufmännische Verwaltung"
  }, {
    name: "Thomas Weber",
    position: "Leiter Vermietung",
    experience: "15 Jahre Erfahrung",
    specialization: "Mieterbetreuung & Objektvermarktung"
  }, {
    name: "Lisa Hoffmann",
    position: "Leiterin Finanzen",
    experience: "12 Jahre Erfahrung",
    specialization: "Nebenkostenabrechnung & Controlling"
  }];
  const achievements = [{
    icon: Trophy,
    number: "37+",
    label: "Jahre Erfahrung"
  }, {
    icon: Building,
    number: "2.000+",
    label: "Verwaltete Einheiten"
  }, {
    icon: Users,
    number: "10.000+",
    label: "Zufriedene Kunden"
  }, {
    icon: Star,
    number: "4.8/5",
    label: "Kundenbewertung"
  }];
  return <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Amiel Immobilienverwaltung
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Seit 1988 Ihr vertrauensvoller Partner für Immobilienverwaltung in München und Umgebung. Mit über 35 Jahren Erfahrung und persönlichem Service.</p>
        </div>

        {/* Achievements */}
        <div className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => <Card key={index} className="text-center p-6">
                <achievement.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">{achievement.number}</div>
                <div className="text-sm text-muted-foreground">{achievement.label}</div>
              </Card>)}
          </div>
        </div>

        {/* About Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Unsere Geschichte</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed max-w-4xl mx-auto text-center mb-12">
            <p>Die Amiel Immobilienverwaltung wurde 1988 in München gegründet und hat sich über mehr als drei Jahrzehnte zu einem der führenden Immobiliendienstleister in der Region entwickelt.</p>
            <p>Was als kleine Hausverwaltung begann, ist heute ein Unternehmen mit einem umfassenden Serviceangebot. Wir betreuen über 300 Wohneinheiten und haben bereits mehr als 4.000 Kunden bei ihren Immobilienangelegenheiten unterstützt.
          </p>
            <p>
              Unser Erfolgsgeheimnis: Die Kombination aus langjähriger Erfahrung, modernster 
              Technik und dem persönlichen Kontakt zu unseren Kunden. Jeder Kunde erhält bei 
              uns einen festen Ansprechpartner und individuelle Betreuung.
            </p>
          </div>
          
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Unsere Mission</h3>
              <p className="text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
                Wir schaffen Vertrauen im Immobilienmarkt durch transparente, zuverlässige 
                und innovative Dienstleistungen. Unser Ziel ist es, für jeden Kunden die 
                optimale Lösung zu finden.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Company Timeline */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Meilensteine unserer Entwicklung</h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => <div key={index} className="relative flex items-start gap-8">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-4 border-background">
                      {milestone.year}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <Card className="flex-1 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>)}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Unsere Werte</h2>
          
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Innovation & Tradition vereint</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Seit über 35 Jahren verbinden wir bewährte Traditionen mit innovativen Lösungen. 
              Unsere Werte sind das Fundament für den vertrauensvollen Umgang mit unseren Kunden 
              und den nachhaltigen Erfolg unseres Unternehmens.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => <Card key={index} className="text-center p-6 h-full">
                <value.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </Card>)}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Unser Führungsteam</h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {team.map((member, index) => <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{member.name}</h3>
                      <p className="text-primary font-medium mb-2">{member.position}</p>
                      <p className="text-sm text-muted-foreground mb-1">{member.experience}</p>
                      <p className="text-xs text-muted-foreground">{member.specialization}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* Services Summary */}
        

        {/* Contact CTA */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="text-center p-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartHandshake className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">Lernen Sie uns kennen</h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Besuchen Sie uns in unserem Büro in München oder vereinbaren Sie einen persönlichen Beratungstermin.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="default">
                  <Phone className="h-5 w-5 mr-2" />
                  +49 089 244 108 610
                </Button>
                <Button size="lg" variant="outline">
                  <Mail className="h-5 w-5 mr-2" />
                  info@amiel-immobilienverwaltung.de
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Balantstraße 55-5, 81541 München</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>;
};
export default Unternehmen;