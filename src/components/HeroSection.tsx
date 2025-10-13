import { PropertySearchFilter } from "./PropertySearchFilter";
import heroPropertyBg from "@/assets/hero-property-bg.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export const HeroSection = () => {
  // Fetch cities count
  const {
    data: citiesCount = 0
  } = useQuery({
    queryKey: ['cities-count'],
    queryFn: async () => {
      const {
        count
      } = await supabase.from('cities').select('*', {
        count: 'exact',
        head: true
      }).eq('is_active', true);
      return count || 0;
    }
  });

  // Fetch properties count
  const {
    data: propertiesCount = 0
  } = useQuery({
    queryKey: ['properties-count'],
    queryFn: async () => {
      const {
        count
      } = await supabase.from('properties').select('*', {
        count: 'exact',
        head: true
      }).eq('is_active', true);
      return count || 0;
    }
  });
  return <section className="relative py-20 md:py-28 bg-cover bg-center bg-no-repeat" style={{
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroPropertyBg})`
  }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg lg:text-5xl">Willkommen zum wohnen, arbeiten &amp; wohlfühlen</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            Entdecken Sie erstklassige Mietwohnungen in Deutschlands beliebtesten Städten. 
            Professionell, vertrauenswürdig, persönlich.
          </p>
        </div>
        
        <div className="mb-8">
          <PropertySearchFilter />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-2xl mx-auto text-center">
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">{propertiesCount}+</div>
            <div className="text-sm text-white/80">Immobilien</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">{citiesCount}</div>
            <div className="text-sm text-white/80">Städte</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">35+</div>
            <div className="text-sm text-white/80">Jahre Erfahrung</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">98%</div>
            <div className="text-sm text-white/80">Zufriedenheit</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">24/7</div>
            <div className="text-sm text-white/80">Service</div>
          </div>
        </div>
      </div>
    </section>;
};