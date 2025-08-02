export const ProjectsSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Unsere Stadt – UNSERE PROJEKTE
          </h2>
          <div className="max-w-5xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Sie suchen ein erstklassiges Immobilienobjekt, vertrauen langjähriger Erfahrung und umfassendem Wissen mit hohem Qualitätsbewusstsein? 
              Dann sind Sie bei uns genau richtig. Wir stellen vor. Die Berlinhaus GmbH entwickelt Einzelhandels- und Büroflächen, Hotels, Ärztehäuser und Wohnimmobilien. 
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Die Ansprüche an den Lebensraum entwickeln sich beständig weiter, innovative Lösungen sind gefragt. Auch modernes Arbeiten braucht ihre passenden Räume. 
              Für jedes unternehmerische Vorhaben sind Räumlichkeiten und Umfeld entscheidende Faktoren, hochwertige Flächen und ganzheitliche Lösungen für Büro, Handel und Gastronomie sind hierfür ansprechend. 
              Wir finden für Sie die optimale Immobilie, ganz nach Ihren Vorstellungen.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-12 max-w-5xl mx-auto">
          <div className="relative group md:w-[35%]">
            <img 
              src="/lovable-uploads/11592b9e-0fa6-423a-bca8-f1636341f7e4.png" 
              alt="Klassisches Gebäude"
              className="w-full h-80 object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="relative group md:w-[65%]">
            <img 
              src="/lovable-uploads/8da215fa-e00e-46ad-acb1-6fddfe11057e.png" 
              alt="Moderne Wohnanlage"
              className="w-full h-80 object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
};