import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Datenschutz = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary">
            Datenschutz
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Datenschutzerklärung
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Informationen zur Verarbeitung Ihrer personenbezogenen Daten gemäß Art. 13, 14 DSGVO
          </p>
        </div>

        <div className="space-y-8">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                1. Verantwortlicher
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Verantwortlicher für die Datenverarbeitung auf dieser Website ist:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium">Amiel Immobilienverwaltung GmbH</p>
                <p className="text-muted-foreground">Balantstraße 55-5, 81541 München</p>
                <p className="text-muted-foreground">Telefon: +49 089 244 108 610</p>
                <p className="text-muted-foreground">E-Mail: info@amiel-immobilienverwaltung.de</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Processing */}
          <Card>
            <CardHeader>
              <CardTitle>
                2. Art und Zweck der Datenverarbeitung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">a) Beim Besuch der Website</h3>
                <p className="text-muted-foreground mb-3">
                  Beim Aufrufen unserer Website werden durch den auf Ihrem Endgerät zum Einsatz kommenden Browser 
                  automatisch Informationen an den Server unserer Website gesendet. Diese Informationen werden 
                  temporär in einem sog. Logfile gespeichert.
                </p>
                <p className="text-muted-foreground">
                  Folgende Informationen werden dabei ohne Ihr Zutun erfasst und bis zur automatisierten Löschung gespeichert:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>IP-Adresse des anfragenden Rechners</li>
                  <li>Datum und Uhrzeit des Zugriffs</li>
                  <li>Name und URL der abgerufenen Datei</li>
                  <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
                  <li>Verwendeter Browser und ggf. das Betriebssystem</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">b) Bei Nutzung unseres Kontaktformulars</h3>
                <p className="text-muted-foreground mb-3">
                  Bei Fragen jeglicher Art bieten wir Ihnen die Möglichkeit, mit uns über ein auf der Website 
                  bereitgestelltes Formular Kontakt aufzunehmen. Dabei sind folgende Angaben erforderlich:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Vor- und Nachname</li>
                  <li>E-Mail-Adresse</li>
                  <li>Telefonnummer</li>
                  <li>Nachrichteninhalt</li>
                  <li>Optional: Adressdaten</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Legal Basis */}
          <Card>
            <CardHeader>
              <CardTitle>
                3. Rechtsgrundlage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Die Verarbeitung Ihrer Daten erfolgt auf Grundlage folgender Rechtsgrundlagen:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-bold">a</span>
                  </div>
                  <p className="text-muted-foreground">
                    <strong>Art. 6 Abs. 1 lit. a DSGVO</strong> - Verarbeitung auf Grundlage Ihrer Einwilligung
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-bold">b</span>
                  </div>
                  <p className="text-muted-foreground">
                    <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> - Verarbeitung zur Erfüllung eines Vertrags
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-bold">f</span>
                  </div>
                  <p className="text-muted-foreground">
                    <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> - Verarbeitung zur Wahrung berechtigter Interessen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Storage */}
          <Card>
            <CardHeader>
              <CardTitle>
                4. Speicherdauer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Wir löschen oder anonymisieren Ihre personenbezogenen Daten, sobald der Zweck der Speicherung entfällt. 
                  Eine weitere Speicherung kann im Einzelfall dann erfolgen, wenn dies durch den europäischen oder 
                  nationalen Gesetzgeber in unionsrechtlichen Verordnungen, Gesetzen oder sonstigen Vorschriften vorgesehen wurde.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Konkrete Speicherfristen:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Server-Logfiles: 7 Tage</li>
                    <li>Kontaktformular-Daten: 2 Jahre</li>
                    <li>E-Mail-Korrespondenz: 3 Jahre</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardHeader>
              <CardTitle>
                5. Ihre Rechte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Sie haben folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Recht auf Auskunft</span>
                  </div>
                  <div>
                    <span className="font-medium">Recht auf Berichtigung</span>
                  </div>
                  <div>
                    <span className="font-medium">Recht auf Löschung</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Recht auf Einschränkung</span>
                  </div>
                  <div>
                    <span className="font-medium">Recht auf Datenübertragbarkeit</span>
                  </div>
                  <div>
                    <span className="font-medium">Widerspruchsrecht</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>
                6. Cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Wir setzen auf unserer Website Cookies ein. Hierbei handelt es sich um kleine Dateien, die Ihr Browser 
                automatisch erstellt und die auf Ihrem Endgerät (Laptop, Tablet, Smartphone o.ä.) gespeichert werden, 
                wenn Sie unsere Seite besuchen.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Verwendete Cookie-Arten:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Technisch notwendige Cookies:</strong> Session-Management, Sicherheit</li>
                  <li><strong>Funktionale Cookies:</strong> Speicherung von Einstellungen</li>
                  <li><strong>Analytische Cookies:</strong> Anonyme Nutzungsstatistiken (nur mit Einwilligung)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>
                7. Kontakt bei Datenschutzfragen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte wenden Sie sich bitte an:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium">Amiel Immobilienverwaltung GmbH</p>
                <p className="text-muted-foreground">Datenschutz</p>
                <p className="text-muted-foreground">Balantstraße 55-5, 81541 München</p>
                <p className="text-muted-foreground">E-Mail: datenschutz@elbtal-immobilien.de</p>
              </div>
              <p className="text-muted-foreground mt-4">
                Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung 
                Ihrer personenbezogenen Daten durch uns zu beschweren.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Datenschutz;