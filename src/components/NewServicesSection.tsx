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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="h-full border-2 border-foreground/20 bg-background shadow-lg">
              <CardHeader className="text-center pb-6 border-b border-foreground/10">
                <div className="w-16 h-1 bg-foreground/30 mx-auto mb-4"></div>
                <CardTitle className="text-2xl font-serif font-bold text-foreground tracking-wide uppercase">
                  {service.title}
                </CardTitle>
                <div className="w-16 h-1 bg-foreground/30 mx-auto mt-4"></div>
              </CardHeader>
              <CardContent className="pt-6 px-6">
                <p className="text-foreground/80 leading-relaxed text-justify font-serif text-base">
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