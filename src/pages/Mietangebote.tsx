import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompactPropertySearchFilter, FilterData } from "@/components/CompactPropertySearchFilter";
import { PropertyListings } from "@/components/PropertyListings";

const Mietangebote = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterData | undefined>(undefined);

  // Read URL parameters and set initial filters
  useEffect(() => {
    const urlFilters: FilterData = {
      location: searchParams.get('location') || '',
      propertyType: searchParams.get('propertyType') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minArea: searchParams.get('minArea') || '',
      rooms: searchParams.get('rooms') || '',
    };
    
    // Only set filters if at least one parameter exists
    const hasFilters = Object.values(urlFilters).some(value => value !== '');
    if (hasFilters) {
      setFilters(urlFilters);
    }
  }, [searchParams]);

  const handleFilterChange = (newFilters: FilterData) => {
    setFilters(newFilters);
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-background border-b border-border py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Mietangebote
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Entdecken Sie unsere hochwertigen Mietwohnungen in den besten Lagen Deutschlands
              </p>
            </div>
          </div>
        </section>

        {/* Search Filter */}
        <section className="py-6 bg-muted/30">
          <div className="container mx-auto px-4">
            <CompactPropertySearchFilter 
              onFilterChange={handleFilterChange} 
              initialFilters={filters}
            />
          </div>
        </section>

        {/* Property Listings */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <PropertyListings filters={filters} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Mietangebote;