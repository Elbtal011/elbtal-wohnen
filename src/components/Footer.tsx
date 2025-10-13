import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
export const Footer = () => {
  return <footer className="bg-gradient-to-b from-secondary/10 to-secondary/30 border-t-2 border-primary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Company Info - Takes full width on mobile, 1 column on desktop */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <img src="/lovable-uploads/f4bd2064-0f8f-4de3-9863-bc4d9797aa3f.png" alt="AMIEL - Immobilienverwaltung seit 1988" className="max-h-20 h-auto w-[70%] md:w-auto object-contain" />
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              Ihr vertrauensvoller Partner für hochwertige Mietwohnungen in Deutschland. 
              Seit über 35 Jahren verbinden wir Menschen mit ihrem perfekten Zuhause.
            </p>
          </div>

          {/* Links Grid - Services and Cities */}
          <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
            {/* Services */}
            <div className="space-y-4">
              <h4 className="font-bold text-foreground text-lg border-l-4 border-primary pl-3">Services</h4>
              <ul className="space-y-3 text-sm text-muted-foreground pl-3">
                <li><Link to="/mietangebote" className="hover:text-primary hover:translate-x-1 inline-block transition-all">→ Mietangebote</Link></li>
                <li><Link to="/vermietungsablauf" className="hover:text-primary hover:translate-x-1 inline-block transition-all">→ Vermietungsablauf</Link></li>
                <li><Link to="/leistungsübersicht" className="hover:text-primary hover:translate-x-1 inline-block transition-all">→ Leistungsübersicht</Link></li>
                <li><Link to="/kontakt" className="hover:text-primary hover:translate-x-1 inline-block transition-all">→ Kundenservice</Link></li>
              </ul>
            </div>

            {/* Cities */}
            <div className="space-y-4">
              <h4 className="font-bold text-foreground text-lg border-l-4 border-primary pl-3">Standorte</h4>
              <ul className="space-y-3 text-sm text-muted-foreground pl-3">
                <li><Link to="/mietangebote?location=Berlin" className="hover:text-primary hover:translate-x-1 inline-block transition-all">→ Berlin</Link></li>
                <li><Link to="/mietangebote?location=Hamburg" className="hover:text-primary hover:translate-x-1 inline-block transition-all">→ Hamburg</Link></li>
                <li><Link to="/mietangebote?location=München" className="hover:text-primary hover:translate-x-1 inline-block transition-all">→ München</Link></li>
                <li><Link to="/mietangebote?location=Frankfurt" className="hover:text-primary hover:translate-x-1 inline-block transition-all">→ Frankfurt</Link></li>
                <li><Link to="/mietangebote?location=Düsseldorf" className="hover:text-primary hover:translate-x-1 inline-block transition-all">→ Düsseldorf</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact - Styled as a card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4 shadow-sm">
              <h4 className="font-bold text-foreground text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Kontakt
              </h4>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Balantstraße 55-5<br />81541 München</span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">+49 089 244 108 610</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground break-all">info@amiel-immobilien.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Mo-Fr: 9:00-18:00 Uhr</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="font-medium">© 2025 Amiel Immobilienverwaltung. Alle Rechte vorbehalten.</div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/impressum" className="hover:text-primary transition-colors font-medium">Impressum</Link>
            <span className="text-border">|</span>
            <Link to="/datenschutz" className="hover:text-primary transition-colors font-medium">Datenschutz</Link>
            <span className="text-border">|</span>
            <Link to="/agb" className="hover:text-primary transition-colors font-medium">AGB</Link>
          </div>
        </div>
      </div>
    </footer>;
};