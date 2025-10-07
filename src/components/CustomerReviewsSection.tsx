import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Familie Schmidt",
    location: "Berlin-Mitte",
    rating: 5,
    text: "Seit 3 Jahren sind wir sehr zufrieden mit der Betreuung durch Amiel. Schnelle Hilfe bei Problemen und immer freundliche Ansprechpartner. Die Verwaltung unserer Wohnung läuft reibungslos."
  },
  {
    id: 2,
    name: "Michael Krause", 
    location: "Hamburg",
    rating: 5,
    text: "Als Vermieter kann ich Amiel nur empfehlen. Die professionelle Verwaltung meiner Immobilien und die transparente Kommunikation haben meine Erwartungen übertroffen. Sehr kompetentes Team!"
  },
  {
    id: 3,
    name: "Dr. Andrea Hoffmann",
    location: "Dresden",
    rating: 5,
    text: "Für unser Ärztehaus haben wir den perfekten Partner gefunden. Von der Planung bis zur laufenden Verwaltung - alles aus einer Hand und mit höchster Qualität. Absolut empfehlenswert!"
  },
  {
    id: 4,
    name: "Restaurant Luna GmbH",
    location: "Leipzig",
    rating: 5,
    text: "Die Betreuung unserer Gastronomieflächen ist vorbildlich. Schnelle Reaktionszeiten bei technischen Problemen und kompetente Beratung in allen Belangen. Ein zuverlässiger Partner."
  },
  {
    id: 5,
    name: "Thomas Weber",
    location: "Potsdam", 
    rating: 5,
    text: "Nach dem Wechsel zu Amiel läuft alles viel besser. Die digitalen Services sind sehr praktisch und der persönliche Kontakt stimmt. Bin sehr froh über diese Entscheidung."
  },
  {
    id: 6,
    name: "Möbel Zentrale GmbH",
    location: "Berlin",
    rating: 5,
    text: "Unsere Einzelhandelsflächen werden professionell und zuverlässig betreut. Das Team von Amiel denkt mit und findet immer passende Lösungen. Sehr zu empfehlen!"
  }
];

export const CustomerReviewsSection = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? "text-yellow-500 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Die Kundenmeinungen
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Was unsere Kunden über uns sagen - echte Bewertungen von zufriedenen Mietern und Eigentümern
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="h-full hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  "{review.text}"
                </p>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-foreground">{review.name}</h4>
                  <p className="text-sm text-muted-foreground">{review.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-background rounded-lg p-4 shadow-sm">
            <div className="flex">{renderStars(5)}</div>
            <span className="text-lg font-semibold">4.9/5</span>
            <span className="text-muted-foreground">aus 127 Bewertungen</span>
          </div>
        </div>
      </div>
    </section>
  );
};