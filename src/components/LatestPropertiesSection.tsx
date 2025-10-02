import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SimplePropertyCard } from "./SimplePropertyCard";
import { Skeleton } from "./ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export const LatestPropertiesSection = () => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['latest-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          city:cities(name, slug),
          property_type:property_types(name, slug)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">Neueste Immobilienangebote</h2>
          <Link to="/mietangebote">
            <Button variant="outline" className="flex items-center gap-2">
              Alle ansehen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <SimplePropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Keine Immobilien verfügbar</p>
          </div>
        )}
      </div>
    </section>
  );
};
