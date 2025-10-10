import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
export const Footer = () => {
  return <footer className="bg-secondary/20 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div>
              <img src="/lovable-uploads/f4bd2064-0f8f-4de3-9863-bc4d9797aa3f.png" alt="AMIEL - Immobilienverwaltung seit 1988" className="max-h-16 h-auto w-auto object-contain mb-2" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ihr vertrauensvoller Partner für hochwertige Mietwohnungen in Deutschland. 
              Seit über 35 Jahren verbinden wir Menschen mit ihrem perfekten Zuhause.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/mietangebote" className="hover:text-primary transition-colors">Mietangebote</Link></li>
              <li><Link to="/vermietungsablauf" className="hover:text-primary transition-colors">Vermietungsablauf</Link></li>
              <li><Link to="/leistungsübersicht" className="hover:text-primary transition-colors">Leistungsübersicht</Link></li>
              <li><Link to="/kontakt" className="hover:text-primary transition-colors">Kundenservice</Link></li>
            </ul>
          </div>

          {/* Cities */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Standorte</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/mietangebote?location=Berlin" className="hover:text-primary transition-colors">Berlin</Link></li>
              <li><Link to="/mietangebote?location=Hamburg" className="hover:text-primary transition-colors">Hamburg</Link></li>
              <li><Link to="/mietangebote?location=München" className="hover:text-primary transition-colors">München</Link></li>
              <li><Link to="/mietangebote?location=Frankfurt" className="hover:text-primary transition-colors">Frankfurt</Link></li>
              <li><Link to="/mietangebote?location=Düsseldorf" className="hover:text-primary transition-colors">Düsseldorf</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Kontakt</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <span>Balantstraße 55-5<br />81541 München</span>
              </div>
              <div>
                <span>+49 089 244 108 610</span>
              </div>
              <div>
                <span>info@amiel-immobilienverwaltung.de</span>
              </div>
              <div>
                <span>Mo-Fr: 9:00-18:00 Uhr</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-muted-foreground">
          <div>© 2025 Amiel Immobilienverwaltung. Alle Rechte vorbehalten.</div>
          <div className="flex space-x-6">
            <Link to="/impressum" className="hover:text-primary transition-colors">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-primary transition-colors">Datenschutz</Link>
            <Link to="/agb" className="hover:text-primary transition-colors">AGB</Link>
          </div>
        </div>
      </div>
    </footer>;
};