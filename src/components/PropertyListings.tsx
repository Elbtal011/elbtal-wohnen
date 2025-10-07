import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SimplePropertyCard, Property } from "@/components/SimplePropertyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FilterData } from "@/components/CompactPropertySearchFilter";

interface PropertyListingsProps {
  filters?: FilterData;
}

export const PropertyListings = ({ filters }: PropertyListingsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price_low' | 'price_high' | 'newest' | 'area'>('newest');
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  
  // Get current page from URL parameters, default to 1
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    fetchProperties();
  }, [sortBy, currentPage, filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Reset to page 1 when filters change
      if (currentPage > 1 && filters) {
        updatePageInUrl(1);
        return;
      }

      // First, get city and property type IDs if filtering by them
      let cityId: string | null = null;
      let propertyTypeId: string | null = null;

      if (filters?.location && filters.location !== "" && filters.location !== "all") {
        const { data: cityData } = await supabase
          .from('cities')
          .select('id')
          .eq('slug', filters.location)
          .single();
        cityId = cityData?.id || null;
      }

      if (filters?.propertyType && filters.propertyType !== "" && filters.propertyType !== "all") {
        const { data: propertyTypeData } = await supabase
          .from('property_types')
          .select('id')
          .eq('slug', filters.propertyType)
          .single();
        propertyTypeId = propertyTypeData?.id || null;
      }

      // Build the main query with joins and filters
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from('properties')
        .select(`
          *,
          city:cities(name, slug),
          property_type:property_types(name, slug)
        `, { count: 'exact' })
        .eq('is_active', true);

      // Apply filters
      if (cityId) {
        query = query.eq('city_id', cityId);
      }
      if (propertyTypeId) {
        query = query.eq('property_type_id', propertyTypeId);
      }
      if (filters?.minPrice && filters.minPrice !== "") {
        query = query.gte('price_monthly', parseInt(filters.minPrice));
      }
      if (filters?.maxPrice && filters.maxPrice !== "") {
        query = query.lte('price_monthly', parseInt(filters.maxPrice));
      }
      if (filters?.minArea && filters.minArea !== "") {
        query = query.gte('area_sqm', parseInt(filters.minArea));
      }
      if (filters?.rooms && filters.rooms !== "" && filters.rooms !== "all") {
        if (filters.rooms === '5+') {
          query = query.gte('rooms', '5');
        } else {
          query = query.eq('rooms', filters.rooms);
        }
      }

      // Apply sorting before pagination
      switch (sortBy) {
        case 'price_low':
          query = query.order('price_monthly', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price_monthly', { ascending: false });
          break;
        case 'area':
          query = query.order('area_sqm', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Apply pagination
      query = query.range(from, to);

      const { data, count, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setProperties(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Fehler beim Laden der Immobilien. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Function to update page in URL
  const updatePageInUrl = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams, { replace: true });
  };

  const handlePageChange = (page: number) => {
    updatePageInUrl(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'price_low': return 'Preis aufsteigend';
      case 'price_high': return 'Preis absteigend';
      case 'area': return 'Größe';
      case 'newest': return 'Neueste zuerst';
      default: return 'Sortieren';
    }
  };

  if (loading) {
    return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 border border-border/50 rounded-lg overflow-hidden">
                <Skeleton className="w-full sm:w-48 lg:w-56 h-48 sm:h-32 flex-shrink-0" />
                <div className="flex-1 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                    <div className="flex-1">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Verfügbare Immobilien
          </h2>
          <p className="text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'Immobilie' : 'Immobilien'} gefunden
            {totalPages > 1 && ` • Seite ${currentPage} von ${totalPages}`}
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="newest">Neueste zuerst</option>
            <option value="price_low">Preis aufsteigend</option>
            <option value="price_high">Preis absteigend</option>
            <option value="area">Nach Größe</option>
          </select>
        </div>
      </div>

      {/* Property List */}
      {properties.length > 0 ? (
        <>
          <div className="space-y-6">
            {properties.map((property) => (
              <SimplePropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Zurück
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Weiter
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Keine Immobilien gefunden
            </h3>
            <p className="text-muted-foreground mb-4">
              Derzeit sind keine Immobilien verfügbar, die Ihren Suchkriterien entsprechen.
            </p>
            <Button variant="outline" onClick={fetchProperties}>
              Erneut laden
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};