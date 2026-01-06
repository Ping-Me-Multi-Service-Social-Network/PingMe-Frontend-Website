import HeroSection from "./components/HeroSection.tsx";
import FeaturesSection from "./components/FeaturesSection.tsx";
import StatsSection from "./components/StatsSection.tsx";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <FeaturesSection />
    </div>
  );
}
