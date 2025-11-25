import { Home, Heart, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Home className="text-primary" size={28} />
            <span className="text-2xl font-bold text-foreground">VacancesFrance</span>
          </a>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Destinations
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              À propos
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Contact
            </a>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2"
              >
                <Shield size={16} />
                Admin
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Heart size={20} />
            </Button>
            {user ? (
              <Button variant="default" onClick={() => navigate("/account")}>
                <User size={20} />
                Mon Compte
              </Button>
            ) : (
              <Button variant="default" onClick={() => navigate("/auth")}>
                <User size={20} />
                Connexion
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
