import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Home, Euro, Ruler, Users, Search } from 'lucide-react';

interface City {
  id: string;
  name: string;
  slug: string;
}

interface PropertyType {
  id: string;
  name: string;
  slug: string;
}

interface Property {
  id: string;
  title: string;
  price_monthly: number;
  area_sqm: number;
  rooms: string;
  address: string;
  city: { name: string };
  property_type: { name: string };
  is_featured: boolean;
  images: string[];
}

interface PropertyListingsProps {
  onFilterChange?: (filters: any) => void;
}

export const PropertyListings: React.FC<PropertyListingsProps> = ({ onFilterChange }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Search filters state
  const [filters, setFilters] = useState({
    location: 'all',
    propertyType: 'all', 
    rooms: 'all',
    minPrice: '',
    maxPrice: '',
    minArea: ''
  });

  // Initialize filters from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const newFilters = {
      location: urlParams.get('location') || 'all',
      propertyType: urlParams.get('propertyType') || 'all',
      rooms: urlParams.get('rooms') || 'all',
      minPrice: urlParams.get('minPrice') || '',
      maxPrice: urlParams.get('maxPrice') || '',
      minArea: urlParams.get('minArea') || ''
    };
    setFilters(newFilters);
  }, [location.search]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [propertiesRes, citiesRes, typesRes] = await Promise.all([
          supabase.from('properties').select(`
            *,
            city:cities(name),
            property_type:property_types(name)
          `).eq('is_active', true),
          supabase.from('cities').select('*').eq('is_active', true).order('display_order'),
          supabase.from('property_types').select('*').eq('is_active', true).order('display_order')
        ]);

        if (propertiesRes.data) setProperties(propertiesRes.data);
        if (citiesRes.data) setCities(citiesRes.data);
        if (typesRes.data) setPropertyTypes(typesRes.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter properties based on current filters
  const filteredProperties = properties.filter(property => {
    // Location filter
    if (filters.location !== 'all') {
      const citySlug = property.city?.name?.toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe') 
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss');
      if (citySlug !== filters.location) return false;
    }

    // Property type filter
    if (filters.propertyType !== 'all') {
      const typeSlug = property.property_type?.name?.toLowerCase();
      if (typeSlug !== filters.propertyType) return false;
    }

    // Rooms filter
    if (filters.rooms !== 'all') {
      if (filters.rooms === '5+') {
        const roomNum = parseInt(property.rooms) || 0;
        if (roomNum < 5) return false;
      } else {
        if (property.rooms !== filters.rooms) return false;
      }
    }

    // Price filters
    if (filters.minPrice && property.price_monthly < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && property.price_monthly > parseInt(filters.maxPrice)) return false;

    // Area filter
    if (filters.minArea && property.area_sqm < parseInt(filters.minArea)) return false;

    return true;
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Immobilien werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter & Suche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Standort
              </Label>
              <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Stadt wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Städte</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.slug}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyType" className="text-sm font-medium flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                Objektart
              </Label>
              <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.slug}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rooms" className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Zimmer
              </Label>
              <Select value={filters.rooms} onValueChange={(value) => handleFilterChange('rooms', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Anzahl" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Zimmer</SelectItem>
                  <SelectItem value="1">1 Zimmer</SelectItem>
                  <SelectItem value="2">2 Zimmer</SelectItem>
                  <SelectItem value="3">3 Zimmer</SelectItem>
                  <SelectItem value="4">4 Zimmer</SelectItem>
                  <SelectItem value="5+">5+ Zimmer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minPrice" className="text-sm font-medium flex items-center gap-2">
                <Euro className="h-4 w-4 text-primary" />
                Miete von
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="z.B. 500"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice" className="text-sm font-medium flex items-center gap-2">
                <Euro className="h-4 w-4 text-primary" />
                Miete bis
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="z.B. 2000"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minArea" className="text-sm font-medium flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                Fläche ab (m²)
              </Label>
              <Input
                id="minArea"
                type="number"
                placeholder="z.B. 50"
                value={filters.minArea}
                onChange={(e) => handleFilterChange('minArea', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Verfügbare Immobilien</h2>
        <p className="text-muted-foreground">
          {filteredProperties.length} {filteredProperties.length === 1 ? 'Immobilie' : 'Immobilien'} gefunden
        </p>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] relative">
                <img
                  src={property.images?.[0] || '/placeholder.svg'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                {property.is_featured && (
                  <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-medium">
                    Empfohlen
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-2 py-1 rounded text-sm font-semibold">
                  {formatPrice(property.price_monthly)}/Monat
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                  {property.address}, {property.city?.name}
                </p>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center">
                    <Ruler className="h-4 w-4 mr-1 text-primary" />
                    <span>{property.area_sqm} m²</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-primary" />
                    <span>{property.rooms} Zimmer</span>
                  </div>
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-1 text-primary" />
                    <span>{property.property_type?.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Immobilien gefunden</h3>
            <p className="text-muted-foreground">
              Versuchen Sie, Ihre Suchfilter anzupassen.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};