import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
const Impressum = () => {
  return <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Impressum
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Angaben gemäß § 5 TMG (Telemediengesetz)
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Company Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Unternehmensdaten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Firmenname</h3>
                  <p className="text-muted-foreground">
                    Amiel Immobilienverwaltung GmbH
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Geschäftsführer</h3>
                  <p className="text-muted-foreground">
                    Amiel Immobilienverwaltung GmbH<br />
                    Balantstraße 55-5<br />
                    81541 München<br />
                    Daniel Amiel, Geschäftsführer
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Amtsgericht</h3>
                  <p className="text-muted-foreground">
                    Amtsgericht München<br />
                    HRB 90221
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Umsatzsteuer-ID</h3>
                  <p className="text-muted-foreground">
                    DE9741089
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Anschrift
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">Amiel Immobilienverwaltung GmbH</p>
                  <p className="text-muted-foreground">Balantstraße 55-5</p>
                  <p className="text-muted-foreground">81541 München</p>
                  <p className="text-muted-foreground">Deutschland</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Kontaktdaten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Telefon</p>
                  <p className="text-muted-foreground">+49 089 244 108 610</p>
                </div>

                <div>
                  <p className="font-medium">E-Mail</p>
                  <p className="text-muted-foreground">info@amiel-immobilienverwaltung.de</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Verantwortlicher i.S.d. § 55 Abs. 2 RStV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">Daniel Amiel</p>
                  <p className="text-muted-foreground">Balantstraße 55-5</p>
                  <p className="text-muted-foreground">81541 München</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Berufsaufsichtsbehörde
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Industrie- und Handelskammer für München und Oberbayern<br />
                    Balanstraße 55–59<br />
                    81541 München
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Legal Information */}
        <div className="mt-12">
          <Card>
            <CardHeader>
                <CardTitle>
                  Haftungsausschluss
                </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Haftung für Inhalte</h3>
                  <p>
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
                    allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
                    unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach 
                    Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Haftung für Links</h3>
                  <p>
                    Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
                    Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten 
                    Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Urheberrecht</h3>
                  <p>
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
                    Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
                    Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Online-Streitbeilegung (OS)</h3>
                  <p>
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                    <a href="https://ec.europa.eu/consumers/odr/" className="text-primary hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                      https://ec.europa.eu/consumers/odr/
                    </a>
                  </p>
                  <p className="mt-2">
                    Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
                    Verbraucherschlichtungsstelle teilzunehmen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>;
};
export default Impressum;