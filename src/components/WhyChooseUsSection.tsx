import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, TrendingUp, Heart, Zap } from "lucide-react";
import teamConsultation from "@/assets/team-consultation.jpg";

export const WhyChooseUsSection = () => {
  const features = [
    {
      icon: Award,
      title: "35+ Jahre Erfahrung",
      description: "Seit 1988 sind wir erfolgreich im deutschen Immobilienmarkt tätig und haben bereits tausende von Mietern glücklich gemacht.",
    },
    {
      icon: TrendingUp,
      title: "Marktführende Expertise",
      description: "Unsere Experten kennen den lokalen Markt in jeder Stadt genau und finden für Sie die besten verfügbaren Immobilien.",
    },
    {
      icon: Heart,
      title: "Persönlicher Service",
      description: "Jeder Kunde ist einzigartig. Wir nehmen uns die Zeit, Ihre individuellen Wünsche und Bedürfnisse zu verstehen.",
    },
    {
      icon: Zap,
      title: "Digitale Innovation",
      description: "Modernste Technologie trifft auf persönliche Betreuung. Erleben Sie Immobiliensuche im digitalen Zeitalter.",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 to-primary-light/10">
      <div className="container mx-auto px-4">
        {/* Header Section with Team Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative order-2 lg:order-1">
            <img 
              src={teamConsultation} 
              alt="Amiel Team bei der Kundenberatung"
              className="rounded-lg shadow-lg w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg"></div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Warum Amiel wählen?
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Wir sind mehr als nur eine Immobilienagentur. Wir sind Ihr Partner 
              auf dem Weg zu Ihrem neuen Zuhause. Unser erfahrenes Team arbeitet 
              täglich daran, Ihnen den bestmöglichen Service zu bieten.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-background/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-8 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Bereit für Ihr neues Zuhause?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Lassen Sie uns gemeinsam die perfekte Wohnung für Sie finden. 
            Unser Team freut sich darauf, Sie kennenzulernen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="text-sm text-muted-foreground">
              Kostenlose Beratung • Keine versteckten Gebühren • Persönlicher Service
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};