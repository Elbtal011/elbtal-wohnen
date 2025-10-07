import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AGB = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary">
            Geschäftsbedingungen
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Gültig ab 01.01.2025 für alle Dienstleistungen der Amiel Immobilienverwaltung GmbH
          </p>
        </div>

        <div className="space-y-8">
          {/* Scope */}
          <Card>
            <CardHeader>
              <CardTitle>
                § 1 Geltungsbereich
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen der 
                  Amiel Immobilienverwaltung GmbH (nachfolgend "Auftragnehmer") und ihren Auftraggebern 
                  (nachfolgend "Auftraggeber") über die Erbringung von Immobilienverwaltungsleistungen.
                </p>
                <p>
                  Abweichende, entgegenstehende oder ergänzende Allgemeine Geschäftsbedingungen des 
                  Auftraggebers werden nur dann und insoweit Vertragsbestandteil, als der Auftragnehmer 
                  ihrer Geltung ausdrücklich schriftlich zugestimmt hat.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>
                § 2 Leistungsumfang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Der Auftragnehmer erbringt Immobilienverwaltungsleistungen nach den Bestimmungen des 
                  individuellen Verwaltungsvertrags. Der Leistungsumfang umfasst insbesondere:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                     <div>
                       <span className="text-sm">• Technische Hausverwaltung</span>
                     </div>
                     <div>
                       <span className="text-sm">• Kaufmännische Verwaltung</span>
                     </div>
                     <div>
                       <span className="text-sm">• Mieterverwaltung</span>
                     </div>
                     <div>
                       <span className="text-sm">• Nebenkostenabrechnung</span>
                     </div>
                   </div>
                   <div className="space-y-3">
                     <div>
                       <span className="text-sm">• Objektbetreuung</span>
                     </div>
                     <div>
                       <span className="text-sm">• Instandhaltungsmanagement</span>
                     </div>
                     <div>
                       <span className="text-sm">• Vermietungsservice</span>
                     </div>
                     <div>
                       <span className="text-sm">• Rechtliche Betreuung</span>
                     </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Terms */}
          <Card>
            <CardHeader>
              <CardTitle>
                § 3 Vertragsschluss und Laufzeit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Der Verwaltungsvertrag kommt durch schriftliche Vereinbarung zwischen den Parteien zustande. 
                  Mündliche Nebenabreden bedürfen zu ihrer Wirksamkeit der schriftlichen Bestätigung.
                </p>
                <p>
                  Der Vertrag wird auf unbestimmte Zeit geschlossen, sofern nicht ausdrücklich eine befristete 
                  Laufzeit vereinbart wird. Beide Parteien können den Vertrag mit einer Frist von drei Monaten 
                  zum Ende eines Kalenderjahres kündigen.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Besondere Kündigungsrechte:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Außerordentliche Kündigung aus wichtigem Grund</li>
                    <li>Kündigung bei Eigentümerwechsel (3 Monate Frist)</li>
                    <li>Kündigung bei wesentlicher Vertragsänderung</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle>
                § 4 Vergütung und Zahlungsbedingungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Die Vergütung richtet sich nach der individuellen Vereinbarung im Verwaltungsvertrag. 
                  Sofern nicht anders vereinbart, werden die Verwaltungsgebühren monatlich im Voraus 
                  zum ersten Werktag des Monats fällig.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Zahlungsmodalitäten:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Zahlung per SEPA-Lastschrift</li>
                      <li>Überweisung auf angegebenes Konto</li>
                      <li>Zahlungsziel: 14 Tage nach Rechnungsstellung</li>
                      <li>Bei Verzug: Verzugszinsen nach § 288 BGB</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Zusätzliche Kosten:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Notariats- und Grundbuchkosten</li>
                      <li>Kosten für externe Dienstleister</li>
                      <li>Porto und Kommunikationskosten</li>
                      <li>Reisekosten bei Objektbesichtigungen</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liability */}
          <Card>
            <CardHeader>
              <CardTitle>
                § 5 Haftung und Haftungsbeschränkung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Der Auftragnehmer haftet für Schäden nur bei Vorsatz und grober Fahrlässigkeit. 
                  Bei leichter Fahrlässigkeit haftet der Auftragnehmer nur bei Verletzung 
                  wesentlicher Vertragspflichten (Kardinalspflichten).
                </p>
                 <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                   <div>
                     <h4 className="font-semibold text-yellow-800 mb-2">Haftungsausschluss:</h4>
                     <p className="text-yellow-700 text-sm">
                       Die Haftung für mittelbare Schäden, Folgeschäden und entgangenen Gewinn 
                       ist ausgeschlossen, soweit gesetzlich zulässig.
                     </p>
                   </div>
                 </div>
                <p>
                  Der Auftragnehmer ist berechtigt und verpflichtet, eine Berufshaftpflichtversicherung 
                  in angemessener Höhe zu unterhalten.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle>
                § 6 Datenschutz und Vertraulichkeit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Der Auftragnehmer verpflichtet sich, alle im Rahmen der Geschäftsbeziehung 
                  erlangten Informationen vertraulich zu behandeln und nur für die vertraglich 
                  vereinbarten Zwecke zu verwenden.
                </p>
                <p>
                  Die Verarbeitung personenbezogener Daten erfolgt ausschließlich nach den 
                  Bestimmungen der Datenschutz-Grundverordnung (DSGVO) und des 
                  Bundesdatenschutzgesetzes (BDSG).
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Vertraulichkeitsumfang:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Mieter- und Eigentümerdaten</li>
                    <li>Finanzielle Informationen</li>
                    <li>Geschäftsgeheimnisse</li>
                    <li>Objektspezifische Daten</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Final Provisions */}
          <Card>
            <CardHeader>
              <CardTitle>
                § 7 Schlussbestimmungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Anwendbares Recht:</h4>
                  <p>
                    Für alle Rechtsbeziehungen zwischen den Parteien gilt ausschließlich deutsches Recht 
                    unter Ausschluss des UN-Kaufrechts.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Gerichtsstand:</h4>
                  <p>
                    Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag 
                    ist Dresden, sofern der Auftraggeber Kaufmann, juristische Person des öffentlichen 
                    Rechts oder öffentlich-rechtliches Sondervermögen ist.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Salvatorische Klausel:</h4>
                  <p>
                    Sollten einzelne Bestimmungen dieser AGB unwirksam oder undurchführbar sein oder werden, 
                    berührt dies die Wirksamkeit der übrigen Bestimmungen nicht. Die unwirksame Bestimmung 
                    wird durch eine wirksame ersetzt, die dem wirtschaftlichen Zweck der unwirksamen 
                    Bestimmung am nächsten kommt.
                  </p>
                </div>

                <div className="border-t pt-4 mt-6">
                  <p className="text-sm">
                    <strong>Stand:</strong> Januar 2025<br />
                    <strong>Amiel Immobilienverwaltung GmbH</strong><br />
                    Leuchtenbergring 54, 81677 München
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AGB;