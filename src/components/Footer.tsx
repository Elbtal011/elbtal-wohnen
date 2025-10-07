import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import logoJK from "@/assets/logo-jk.png";

export const Footer = () => {
  return <footer className="bg-secondary/10 border-t border-border/50">
      <div className="container mx-auto px-4 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <img src={logoJK} alt="JK Immobilien" className="max-h-20 h-auto w-[70%] md:w-auto object-contain" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ihr vertrauensvoller Partner für hochwertige Mietwohnungen in Deutschland. 
              Seit über 35 Jahren verbinden wir Menschen mit ihrem perfekten Zuhause.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-5">
            <h4 className="font-semibold text-foreground text-base uppercase tracking-wide">Services</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/mietangebote" className="hover:text-foreground transition-colors">Mietangebote</Link></li>
              <li><Link to="/vermietungsablauf" className="hover:text-foreground transition-colors">Vermietungsablauf</Link></li>
              <li><Link to="/leistungsübersicht" className="hover:text-foreground transition-colors">Leistungsübersicht</Link></li>
              <li><Link to="/kontakt" className="hover:text-foreground transition-colors">Kundenservice</Link></li>
            </ul>
          </div>

          {/* Cities */}
          <div className="space-y-5">
            <h4 className="font-semibold text-foreground text-base uppercase tracking-wide">Standorte</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/mietangebote?location=Berlin" className="hover:text-foreground transition-colors">Berlin</Link></li>
              <li><Link to="/mietangebote?location=Hamburg" className="hover:text-foreground transition-colors">Hamburg</Link></li>
              <li><Link to="/mietangebote?location=München" className="hover:text-foreground transition-colors">München</Link></li>
              <li><Link to="/mietangebote?location=Frankfurt" className="hover:text-foreground transition-colors">Frankfurt</Link></li>
              <li><Link to="/mietangebote?location=Düsseldorf" className="hover:text-foreground transition-colors">Düsseldorf</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h4 className="font-semibold text-foreground text-base uppercase tracking-wide">Kontakt</h4>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">Adresse</p>
                <p>Balantstraße 55-5<br />81541 München</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Telefon</p>
                <p>+49 089 244 108 610</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">E-Mail</p>
                <p className="break-all">info@amiel-immobilienverwaltung.de</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Öffnungszeiten</p>
                <p>Mo-Fr: 9:00-18:00 Uhr</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-border/50" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>© 2025 Amiel Immobilienverwaltung. Alle Rechte vorbehalten.</div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/impressum" className="hover:text-foreground transition-colors">Impressum</Link>
            <span className="text-muted-foreground/30">•</span>
            <Link to="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link>
            <span className="text-muted-foreground/30">•</span>
            <Link to="/agb" className="hover:text-foreground transition-colors">AGB</Link>
          </div>
        </div>
      </div>
    </footer>;
};