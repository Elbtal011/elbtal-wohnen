import immobilienImage from "@/assets/immobilien-mit-zukunft.jpg";

export const ProjectsSection = () => {
  return <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Image on the left */}
          <div className="lg:w-1/2">
            <div className="relative group">
              <img src={immobilienImage} alt="Luxusvilla mit Pool bei Nacht" className="w-full h-[450px] object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
          
          {/* Text content on the right */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Immobilien mit Zukunft</h2>
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">Die Amiel Immobilienverwaltung GmbH entwickelt hochwertige Wohn-, Büro- und Handelsimmobilien sowie Hotels und Ärztehäuser. Mit langjähriger Erfahrung, Fachwissen und Qualitätsbewusstsein schaffen wir moderne Lösungen für Wohnen und Arbeiten.</p>
              <p className="text-lg text-muted-foreground leading-relaxed">Wir wissen: Lebens- und Arbeitsräume verändern sich stetig. Deshalb bieten wir innovative Konzepte und maßgeschneiderte Flächen für Büro, Handel und Gastronomie. Unser Ziel: die optimale Immobilie für Ihre Bedürfnisse – funktional, nachhaltig und zukunftsorientiert.</p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};