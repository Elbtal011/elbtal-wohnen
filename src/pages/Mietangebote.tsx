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
      rooms: searchParams.get('rooms') || ''
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
  return <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        

        {/* Search Filter */}
        <section className="py-6 bg-white">
          <div className="container mx-auto px-4">
            <CompactPropertySearchFilter onFilterChange={handleFilterChange} initialFilters={filters} />
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
    </div>;
};
export default Mietangebote;