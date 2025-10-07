import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Briefcase, Headphones } from "lucide-react";
const services = [{
  icon: Target,
  title: "Unsere ZIELE",
  description: "Wir streben nach höchster Qualität in der Immobilienverwaltung und schaffen langfristige Werte für unsere Kunden. Unser Ziel ist es, durch professionelle Betreuung und transparente Kommunikation das Vertrauen unserer Mieter und Eigentümer zu gewinnen."
}, {
  icon: Briefcase,
  title: "Unsere ­ANGEBOTE",
  description: "Von der kompletten Hausverwaltung über Mietverwaltung bis hin zur technischen Betreuung bieten wir umfassende Dienstleistungen. Unsere Expertise umfasst Objektbetreuung, Mieterberatung, Instandhaltung und kaufmännische Verwaltung für alle Immobilienarten."
}, {
  icon: Headphones,
  title: "Unser ­SERVICE",
  description: "24/7 Erreichbarkeit für Notfälle, regelmäßige Objektbesichtigungen und proaktive Wartung stehen im Mittelpunkt unseres Service. Wir bieten persönliche Beratung, digitale Verwaltungslösungen und schnelle Problemlösung für alle Anliegen."
}];
export const NewServicesSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="h-full hover:shadow-xl transition-all duration-500 border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground leading-relaxed text-center">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};