import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const services = [{
  title: "Unsere Grundsätze",
  description: "Seit jeher verpflichten wir uns höchsten Standards in der Immobilienverwaltung und schaffen beständige Werte für unsere geschätzte Kundschaft. Unser oberstes Bestreben liegt darin, durch gewissenhafte Betreuung und aufrichtige Kommunikation das wohlverdiente Vertrauen unserer Mieter sowie Eigentümer zu erlangen."
}, {
  title: "Unser Leistungsspektrum",
  description: "Von der vollumfänglichen Hausverwaltung über die sorgsame Mietverwaltung bis hin zur fachkundigen technischen Betreuung erstreckt sich unser bewährtes Dienstleistungsangebot. Unsere langjährige Erfahrung umfasst die Objektbetreuung, Mieterberatung, Instandhaltung sowie die kaufmännische Verwaltung sämtlicher Immobilienarten."
}, {
  title: "Unser Kundenservice",
  description: "Rund um die Uhr stehen wir für dringende Angelegenheiten zur Verfügung, führen regelmäßige Objektbesichtigungen durch und sorgen für vorbeugende Wartungsmaßnahmen. Wir bieten persönliche Fachberatung, moderne Verwaltungslösungen und zügige Problemlösung für sämtliche Anliegen unserer Klientel."
}];
export const NewServicesSection = () => {
  return (
    <section className="py-20" style={{backgroundColor: '#F9F9FA'}}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="h-full border border-foreground/10 bg-white">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-6">
                <p className="text-muted-foreground leading-relaxed text-center">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};