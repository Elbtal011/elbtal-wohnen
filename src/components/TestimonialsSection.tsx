import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import happyClients from "@/assets/happy-clients.jpg";

export const TestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      name: "Sarah Mueller",
      city: "Berlin",
      rating: 5,
      text: "Amiel hat mir dabei geholfen, die perfekte Wohnung in Berlin zu finden. Der Service war ausgezeichnet und die Beratung sehr professionell. Absolut empfehlenswert!",
    },
    {
      name: "Thomas Weber",
      city: "München",
      rating: 5,
      text: "Sehr zufrieden mit dem Service von Amiel. Die Wohnungssuche war unkompliziert und das Team war immer erreichbar. Tolle Betreuung vom ersten Kontakt bis zur Schlüsselübergabe.",
    },
    {
      name: "Anna Schmidt",
      city: "Hamburg",
      rating: 5,
      text: "Endlich eine Immobilienagentur, die hält was sie verspricht! Transparente Preise, faire Konditionen und ein super freundliches Team. Vielen Dank für die großartige Unterstützung.",
    },
    {
      name: "Michael Bauer",
      city: "Frankfurt",
      rating: 5,
      text: "Die Wohnungsbesichtigung war perfekt organisiert und die Abwicklung sehr professionell. Amiel macht die Wohnungssuche so einfach wie nie zuvor. Absolute Empfehlung!",
    },
  ];

  // Group testimonials into slides of 2
  const slides = [];
  for (let i = 0; i < testimonials.length; i += 2) {
    slides.push(testimonials.slice(i, i + 2));
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header with Happy Clients Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Was unsere Kunden sagen
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Überzeugen Sie sich selbst von der Qualität unseres Services. 
              Hier teilen zufriedene Mieter ihre Erfahrungen mit Amiel und 
              erzählen, wie wir ihnen beim Finden ihres Traumzuhauses geholfen haben.
            </p>
          </div>
          <div className="relative">
            <img 
              src={happyClients} 
              alt="Zufriedene Kunden mit ihren neuen Wohnungsschlüsseln"
              className="rounded-lg shadow-lg w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg"></div>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative w-full max-w-[1250px] mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 bg-background shadow-lg"
            onClick={prevSlide}
            disabled={slides.length <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 bg-background shadow-lg"
            onClick={nextSlide}
            disabled={slides.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Testimonials Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {slide.map((testimonial, index) => (
                      <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center mb-4">
                            <div className="flex space-x-1">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                              ))}
                            </div>
                          </div>
                          <blockquote className="text-muted-foreground mb-4 italic leading-relaxed">
                            "{testimonial.text}"
                          </blockquote>
                          <div className="border-t border-border pt-4">
                            <div className="font-semibold text-foreground">{testimonial.name}</div>
                            <div className="text-sm text-muted-foreground">{testimonial.city}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          {slides.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentSlide ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <div className="inline-flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold">4.9/5</span>
            </div>
            <span>•</span>
            <span>Basierend auf 247 Bewertungen</span>
          </div>
        </div>
      </div>
    </section>
  );
};
