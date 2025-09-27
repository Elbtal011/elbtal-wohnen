import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Link } from "react-router-dom";
import { 
  MapPin 
} from "lucide-react";

export interface Property {
  id: string;
  title: string;
  description: string;
  price_monthly: number;
  area_sqm: number;
  rooms: string;
  address: string;
  postal_code?: string;
  neighborhood: string;
  city: { name: string } | null;
  property_type: { name: string } | null;
  floor: number;
  balcony: boolean;
  elevator: boolean;
  parking: boolean;
  pets_allowed: boolean;
  furnished: boolean;
  available_from: string;
  images: string[];
  features: string[];
  is_featured: boolean;
}

interface SimplePropertyCardProps {
  property: Property;
}

export const SimplePropertyCard = ({ property }: SimplePropertyCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border border-border/50 hover:border-primary/20">
      <CardContent className="p-0 h-full">
        <div className="flex flex-col h-full">
          {/* Image */}
          <Link to={`/immobilie/${property.id}`} className="block overflow-hidden">
            <div className="relative w-full aspect-[4/3]">
              <div className="w-full h-full overflow-hidden cursor-pointer">
                <img
                  src={property.images[0] || '/placeholder.svg'}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {property.is_featured && (
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground shadow-lg">
                    Empfohlen
                  </Badge>
                )}
              </div>
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-lg text-foreground line-clamp-2">
                  {property.title}
                </h3>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{`${property.postal_code ? property.postal_code + ' ' : ''}${property.city?.name || 'Stadt nicht verfügbar'}`}</span>
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-foreground">
                  <span className="font-medium">Wohnfläche:</span>
                  <div className="font-bold">{property.area_sqm} m²</div>
                </div>
                <div className="text-foreground">
                  <span className="font-medium">Zimmer:</span>
                  <div className="font-bold">{property.rooms}</div>
                </div>
              </div>

              {/* Price */}
              <div className="pt-2 border-t border-border/50">
                <div className="text-lg font-bold text-primary">
                  {formatPrice(property.price_monthly)}
                  <span className="text-sm font-normal text-muted-foreground">/Monat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};