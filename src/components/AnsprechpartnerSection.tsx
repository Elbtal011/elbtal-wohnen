import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail } from "lucide-react";
import ContactForm from "@/components/SimpleContactForm";

const ansprechpartner = [
  {
    id: 1,
    title: "Ihr Verwalter",
    name: "Daniel Amiel",
    phone: "+49 30 123456789",
    email: "info@amiel-immobilienverwaltung.de",
    description: "Allgemeine Verwaltungsangelegenheiten",
    image: "/lovable-uploads/794cf7ca-0c21-48b6-8856-3f24fa932c56.png"
  },
  {
    id: 2,
    title: "Ihr Techniker", 
    name: "Thomas Karlstein",
    phone: "+49 30 987654321",
    email: "info@amiel-immobilienverwaltung.de",
    description: "Technische Angelegenheiten & Schadensmeldungen",
    image: "/lovable-uploads/d6fb0e5c-3998-42cf-b2fc-b5915b06d762.png"
  },
  {
    id: 3,
    title: "Schadensbearbeitung",
    name: "Maria Rosenthal",
    phone: "+49 30 555123456",
    email: "info@amiel-immobilienverwaltung.de", 
    description: "Schadensmeldungen & Versicherungsangelegenheiten",
    image: "/lovable-uploads/37f77204-1324-4ab1-bae3-696640f6ce97.png"
  },
  {
    id: 4,
    title: "Buchhaltung",
    name: "Andrea Klein",
    phone: "+49 30 444987654",
    email: "info@amiel-immobilienverwaltung.de",
    description: "Abrechnungen & finanzielle Angelegenheiten",
    image: "/lovable-uploads/264784dc-8e41-42aa-9e8e-8e42c707c9fb.png"
  }
];

export const AnsprechpartnerSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ihre Ansprechpartner
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Sie suchen den richtigen Ansprechpartner, Ihren Verwalter oder Ihren Techniker für eine Schadenanzeige? 
            Wählen Sie einfach hier den passenden Fachbereich aus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ansprechpartner.map((person) => (
            <Card key={person.id} className="h-full hover:shadow-md transition-all border border-border/60">
              <CardHeader className="text-center p-0">
                <div className="w-full aspect-square overflow-hidden">
                  <img
                    src={person.image}
                    alt={`${person.name} - ${person.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardHeader>
              <CardContent className="text-center space-y-4 pt-6">
                <div>
                  <h4 className="font-semibold text-xl text-foreground">{person.name}</h4>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.location.href = `tel:${person.phone}`}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {person.phone}
                  </Button>
                  
                  <ContactForm
                    isDialog={true}
                    trigger={
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                      >
                        Anfrage senden
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};