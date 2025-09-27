import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      // Close mobile menu if open
      setIsMenuOpen(false);
      if (error) {
        // Proceed anyway but inform user
        toast({ title: 'Abmeldung', description: 'Sitzung bereits beendet. Weiterleitung...', variant: 'destructive' });
      } else {
        toast({ title: 'Abgemeldet', description: 'Sie wurden erfolgreich abgemeldet.' });
      }
    } catch (e) {
      // Fail-safe: continue
      setIsMenuOpen(false);
      toast({ title: 'Abmeldung', description: 'Es gab ein Problem, Sie wurden dennoch abgemeldet.', variant: 'destructive' });
    } finally {
      // Always redirect to auth landing
      navigate('/auth');
    }
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="block">
              <img 
                src="/lovable-uploads/f4bd2064-0f8f-4de3-9863-bc4d9797aa3f.png" 
                alt="AMIEL - Immobilienverwaltung seit 1988" 
                className="h-10 w-auto lg:h-10 md:h-8 h-6"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Startseite
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground hover:text-primary">
                  Wohnen & Service
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px]">
                    <Link to="/mietangebote">
                      <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Mietangebote</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Entdecken Sie unsere aktuellen Mietangebote
                        </p>
                      </NavigationMenuLink>
                    </Link>
                    <Link to="/vermietungsablauf">
                      <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Vermietungsablauf</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Erfahren Sie mehr über unseren Vermietungsprozess
                        </p>
                      </NavigationMenuLink>
                    </Link>
                    <Link to="/leistungsübersicht">
                      <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Leistungsübersicht</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Alle unsere Services im Überblick
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/kontakt">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Kontakt
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/unternehmen">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Unternehmen
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Auth Section */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Mein Bereich
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full">
                      Mein Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-white text-gray-700 border border-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors">
                <Link to="/auth">
                  Anmelden
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div
            className="lg:hidden cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md">
                Startseite
              </Link>
              <div className="space-y-1">
                <button className="flex items-center justify-between w-full px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md">
                  Wohnen & Service
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="pl-4 space-y-1">
                  <Link to="/mietangebote" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary">
                    Mietangebote
                  </Link>
                  <Link to="/vermietungsablauf" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary">
                    Vermietungsablauf
                  </Link>
                  <Link to="/leistungsübersicht" className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary">
                    Leistungsübersicht
                  </Link>
                </div>
              </div>
              <Link to="/kontakt" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md">
                Kontakt
              </Link>
              <Link to="/unternehmen" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md">
                Unternehmen
              </Link>
              
              {/* Mobile Auth Section */}
              {user ? (
                <div className="border-t border-border pt-2 mt-2 space-y-1">
                  <Link to="/profile" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md">
                    Mein Profil
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-2 inline" />
                    Abmelden
                  </button>
                </div>
              ) : (
                <div className="border-t border-border pt-2 mt-2">
                  <Link to="/auth" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md">
                    Anmelden
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};