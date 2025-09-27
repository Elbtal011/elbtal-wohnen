import { PropertySearchFilter } from "./PropertySearchFilter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import heroSlider1 from "@/assets/hero-slider-1.jpg";
import heroSlider2 from "@/assets/hero-slider-2.jpg";
import heroSlider3 from "@/assets/hero-slider-3.jpg";
import heroSlider4 from "@/assets/hero-slider-4.jpg";
export const HeroSection = () => {
  const heroImages = [heroSlider1, heroSlider2, heroSlider3, heroSlider4];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Change image every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [heroImages.length]);

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

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background Image Slider with Ken Burns Effect */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center animate-kenBurns"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${image})`
              }}
            />
          </div>
        ))}
      </div>
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
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
    </section>
  );
};