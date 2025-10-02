import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import PropertyImageGallery from '@/components/PropertyImageGallery';
import ContactForm from '@/components/SimpleContactForm';
import PropertyApplicationFlow from '@/components/PropertyApplicationFlow';
import SimpleLocationDisplay from '@/components/SimpleLocationDisplay';
import { 
  MapPin, 
  Ruler, 
  Users, 
  Calendar,
  Car,
  ArrowUp,
  PawPrint,
  Star,
  CheckCircle,
  Share2,
  Clock,
  MessageSquare,
  ArrowLeft,
  Flame,
  Zap
} from "lucide-react";

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) throw new Error('Property ID is required');
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          city:cities(name),
          property_type:property_types(name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <Skeleton className="h-96 w-full mb-6" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Immobilie nicht gefunden</h1>
            <p className="text-muted-foreground">
              Die angeforderte Immobilie konnte nicht gefunden werden.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = (property.images && property.images.length > 0) ? property.images : ['/placeholder.svg'];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/mietangebote">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zu Mietangebote
            </Button>
          </Link>
        </div>

        {/* Property Images - Full Width */}
        <PropertyImageGallery 
          images={images}
          title={property.title}
          className="mb-6"
        />

        {/* Property Title and Info - Full Width */}
        <div className="mb-6">
          {property.is_featured && (
            <Badge className="mb-3 bg-accent text-accent-foreground">
              <Star className="w-3 h-3 mr-1" />
              Empfohlen
            </Badge>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">
                  {property.property_type?.name || 'Typ nicht verfügbar'}
                </Badge>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.city?.name || 'Stadt nicht verfügbar'}
                </div>
              </div>
              <h1 className="text-xl md:text-2xl font-bold mb-2">{property.title}</h1>
              <p className="text-lg text-muted-foreground">
                {property.address}, {property.neighborhood}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xl md:text-3xl font-bold text-foreground">
                {property.warmmiete_monthly 
                  ? formatPrice(property.warmmiete_monthly) 
                  : formatPrice(property.price_monthly + (property.additional_costs_monthly || 0))
                }
              </div>
              <div className="text-sm text-muted-foreground">Warmmiete</div>
            </div>
          </div>
        </div>

        {/* Two Column Layout - Description and Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Description - 60% */}
          <div className="lg:col-span-3">
            {/* Property Application Button */}
            <div className="mb-6">
              <PropertyApplicationFlow
                propertyId={property.id}
                propertyTitle={property.title}
                trigger={
                  <Button className="bg-background text-foreground border border-foreground/30 hover:bg-primary hover:text-primary-foreground transition-colors" size="lg">
                    Für Immobilie bewerben
                  </Button>
                }
              />
            </div>

            {/* Property Details */}
            <Card className="mb-6 border-0 shadow-sm rounded-xl bg-muted/40">
              <div className="p-6 pb-0">
                <CardTitle className="text-lg md:text-xl mb-6">Objektbeschreibung</CardTitle>
              </div>
              <CardContent>
                <div className="text-muted-foreground leading-relaxed mb-6">
                  <div dangerouslySetInnerHTML={{
                    __html: property.description.replace(/\n/g, '<br />')
                  }} />
                </div>

                {/* Eigenschaften Tags */}
                {(property as any).eigenschaften_tags && (property as any).eigenschaften_tags.length > 0 && (
                  <>
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Eigenschaften Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {(property as any).eigenschaften_tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator className="my-6" />
                  </>
                )}


                {/* Ausstattung Section */}
                {property.features_description && (
                  <>
                    <div className="mb-6">
                      <CardTitle className="mb-3 text-lg md:text-xl">Ausstattung</CardTitle>
                      <div className="text-muted-foreground leading-relaxed">
                        <div dangerouslySetInnerHTML={{
                          __html: property.features_description.replace(/\n/g, '<br />')
                        }} />
                      </div>
                    </div>
                    <Separator className="my-6" />
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-3">Grunddaten</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-medium">{property.id.slice(0, 8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kaltmiete:</span>
                        <span className="font-medium">{formatPrice(property.price_monthly)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nebenkosten:</span>
                        <span className="font-medium">{property.additional_costs_monthly ? formatPrice(property.additional_costs_monthly) : 'Nicht angegeben'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Warmmiete:</span>
                        <span className="font-medium">
                          {property.warmmiete_monthly 
                            ? formatPrice(property.warmmiete_monthly) 
                            : formatPrice(property.price_monthly + (property.additional_costs_monthly || 0))
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kaution:</span>
                        <span className="font-medium">{property.deposit_months} Monatsmieten</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Flächenangaben</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wohnfläche:</span>
                        <span className="font-medium">{property.area_sqm} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Zimmer:</span>
                        <span className="font-medium">{property.rooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Etage:</span>
                        <span className="font-medium">{property.floor}. OG</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Baujahr:</span>
                        <span className="font-medium">{property.year_built || 'Nicht angegeben'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Verfügbar ab:</span>
                        <span className="font-medium">{formatDate(property.available_from)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Address Section */}
                <div className="mb-6">
                  <CardTitle className="mb-3 text-lg md:text-xl">Adresse</CardTitle>
                  <div className="space-y-2">
                    <div className="text-lg font-medium">{property.address}</div>
                    <div className="text-muted-foreground">
                      {property.postal_code && `${property.postal_code} `}
                      <span className="font-medium">{property.city?.name}</span>
                      {property.neighborhood && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{property.neighborhood}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Energy Information */}
                <div className="mb-6">
                  <CardTitle className="mb-3 text-lg md:text-xl">
                    Energie & Heizung
                  </CardTitle>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Energieausweis:</span>
                      <p className="font-medium">{property.energy_certificate_type || 'Nicht angegeben'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Heizungsart:</span>
                      <p className="font-medium">{property.heating_type || 'Nicht angegeben'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Energieträger:</span>
                      <p className="font-medium">{property.heating_energy_source || 'Nicht angegeben'}</p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact Info - 40% */}
          <div className="lg:col-span-2">
            {/* Contact Details */}
            <Card className="mb-6 border-0 shadow-sm rounded-xl bg-muted/40">
              <div className="p-6 pb-0">
                <CardTitle className="text-lg md:text-xl mb-6">Kontakt</CardTitle>
              </div>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Telefon:</span>
                    <span className="font-medium">+49 089 244 108 610</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">E-Mail:</span>
                    <span className="font-medium break-all">info@amiel-immobilienverwaltung.de</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operation Hours */}
            <Card className="mb-6 border-0 shadow-sm rounded-xl bg-muted/40">
              <div className="p-6 pb-0">
                <CardTitle className="text-lg md:text-xl mb-6">Öffnungszeiten</CardTitle>
              </div>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Montag - Freitag</span>
                    <span className="font-medium">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samstag</span>
                    <span className="font-medium">9:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sonntag</span>
                    <span className="font-medium text-muted-foreground">Geschlossen</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Button */}
            <ContactForm
              propertyId={property.id}
              propertyTitle={property.title}
              isDialog={true}
              trigger={
                <Button className="w-full mb-6 bg-background text-foreground border border-foreground/30 hover:bg-primary hover:text-primary-foreground transition-colors" size="lg">
                  Anfrage senden
                </Button>
              }
            />

            {/* Location */}
            <Card className="border-0 shadow-sm rounded-xl bg-muted/40 overflow-hidden">
              <div className="p-6 pb-0">
                <CardTitle className="text-lg md:text-xl mb-6">Lage</CardTitle>
              </div>
              <CardContent className="p-0">
                <SimpleLocationDisplay 
                  address={property.address}
                  city={property.city?.name || ''}
                  postalCode={property.postal_code || undefined}
                  neighborhood={property.neighborhood || undefined}
                  locationDescription={(property as any).eigenschaften_description || undefined}
                  className="w-full p-6 pt-2"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetails;