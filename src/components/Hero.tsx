import { Search, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-villa.jpg";

export const Hero = () => {
  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/30 to-foreground/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
          Votre séjour de rêve en France
        </h1>
        <p className="text-xl md:text-2xl mb-12 text-white/95 max-w-3xl mx-auto drop-shadow-lg">
          Découvrez des locations saisonnières exceptionnelles dans toute la France
        </p>

        {/* Search Bar */}
        <div className="bg-card rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto backdrop-blur-sm bg-card/95">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-background rounded-lg px-4 py-3 border border-border">
              <MapPin className="text-muted-foreground" size={20} />
              <Input 
                placeholder="Destination" 
                className="border-0 focus-visible:ring-0 p-0 h-auto bg-transparent"
              />
            </div>
            <div className="flex items-center gap-3 bg-background rounded-lg px-4 py-3 border border-border">
              <Calendar className="text-muted-foreground" size={20} />
              <Input 
                placeholder="Dates" 
                className="border-0 focus-visible:ring-0 p-0 h-auto bg-transparent"
              />
            </div>
            <Button variant="hero" size="lg" className="w-full">
              <Search size={20} />
              Rechercher
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
