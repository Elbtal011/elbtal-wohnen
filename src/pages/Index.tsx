import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { NewServicesSection } from "@/components/NewServicesSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { CustomerReviewsSection } from "@/components/CustomerReviewsSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <NewServicesSection />
        <ProjectsSection />
        <CustomerReviewsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
