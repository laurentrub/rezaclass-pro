import { Home, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="text-primary" size={28} />
            <span className="text-2xl font-bold text-foreground">VacancesFrance</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Destinations
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              À propos
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Heart size={20} />
            </Button>
            <Button variant="default">
              <User size={20} />
              Connexion
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
