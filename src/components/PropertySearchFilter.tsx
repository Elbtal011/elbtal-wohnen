import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
export const PropertySearchFilter = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    location: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    rooms: ""
  });

  // Fetch cities dynamically
  const {
    data: cities = []
  } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('cities').select('id, name, slug').eq('is_active', true).order('display_order');
      if (error) throw error;
      // Filter out cities with empty slugs or names to prevent Select.Item errors
      return (data || []).filter(city => city.slug && city.slug.trim() !== '' && city.name && city.name.trim() !== '');
    }
  });

  // Fetch property types dynamically
  const {
    data: propertyTypes = []
  } = useQuery({
    queryKey: ['property-types'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('property_types').select('id, name, slug').eq('is_active', true).order('display_order');
      if (error) throw error;
      // Filter out property types with empty slugs or names to prevent Select.Item errors
      return (data || []).filter(type => type.slug && type.slug.trim() !== '' && type.name && type.name.trim() !== '');
    }
  });
  const handleSearch = () => {
    // Create URL search params to pass the filters
    const params = new URLSearchParams();
    if (searchData.location) params.append('location', searchData.location);
    if (searchData.propertyType) params.append('propertyType', searchData.propertyType);
    if (searchData.minPrice) params.append('minPrice', searchData.minPrice);
    if (searchData.maxPrice) params.append('maxPrice', searchData.maxPrice);
    if (searchData.minArea) params.append('minArea', searchData.minArea);
    if (searchData.rooms) params.append('rooms', searchData.rooms);

    // Navigate to Mietangebote page with search parameters
    navigate(`/mietangebote?${params.toString()}`);
  };
  return <Card className="w-full max-w-5xl mx-auto p-4 md:p-8 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
      <div className="space-y-4 md:space-y-8">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Entdecken Sie Ihr neues Zuhause</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Suchen Sie in Berlin, Hamburg, München, Frankfurt, Düsseldorf und weiteren Städten
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Location */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="location" className="text-xs md:text-sm font-medium">
              Standort
            </Label>
            <Select value={searchData.location} onValueChange={value => setSearchData({
            ...searchData,
            location: value
          })}>
              <SelectTrigger className="h-12 text-xs md:text-sm">
                <SelectValue placeholder="Stadt wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Städte</SelectItem>
                {cities.map(city => <SelectItem key={city.id} value={city.slug}>
                    {city.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Property Type */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="propertyType" className="text-xs md:text-sm font-medium">
              Objektart
            </Label>
            <Select value={searchData.propertyType} onValueChange={value => setSearchData({
            ...searchData,
            propertyType: value
          })}>
              <SelectTrigger className="h-12 text-xs md:text-sm">
                <SelectValue placeholder="Typ wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                {propertyTypes.map(type => <SelectItem key={type.id} value={type.slug}>
                    {type.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Min Price */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="minPrice" className="text-xs md:text-sm font-medium">
              Miete von
            </Label>
            <Input id="minPrice" type="number" placeholder="z.B. 500" className="h-12 text-xs md:text-sm" value={searchData.minPrice} onChange={e => setSearchData({
            ...searchData,
            minPrice: e.target.value
          })} />
          </div>

          {/* Max Price */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="maxPrice" className="text-xs md:text-sm font-medium">
              Miete bis
            </Label>
            <Input id="maxPrice" type="number" placeholder="z.B. 2000" className="h-12 text-xs md:text-sm" value={searchData.maxPrice} onChange={e => setSearchData({
            ...searchData,
            maxPrice: e.target.value
          })} />
          </div>

          {/* Area */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="minArea" className="text-xs md:text-sm font-medium">
              Fläche ab (m²)
            </Label>
            <Input id="minArea" type="number" placeholder="z.B. 50" className="h-12 text-xs md:text-sm" value={searchData.minArea} onChange={e => setSearchData({
            ...searchData,
            minArea: e.target.value
          })} />
          </div>

          {/* Rooms */}
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="rooms" className="text-xs md:text-sm font-medium">
              Zimmer
            </Label>
            <Select value={searchData.rooms} onValueChange={value => setSearchData({
            ...searchData,
            rooms: value
          })}>
              <SelectTrigger className="h-12 text-xs md:text-sm">
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
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSearch} className="w-auto px-8" size="lg">
            Suchen
          </Button>
        </div>
      </div>
    </Card>;
};