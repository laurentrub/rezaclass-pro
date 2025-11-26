import { Home, Heart, User, Shield, Menu, MessageCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

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
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-4 mt-6">
                {user ? (
                  <Button
                    variant="ghost"
                    className="justify-start gap-3 h-auto py-3"
                    onClick={() => navigate("/account")}
                  >
                    <User size={20} />
                    <span>Mon Compte</span>
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="justify-start gap-3 h-auto py-3"
                    onClick={() => navigate("/auth")}
                  >
                    <User size={20} />
                    <span>Connexion</span>
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  className="justify-start gap-3 h-auto py-3"
                >
                  <Heart size={20} />
                  <span>Mes favoris</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="justify-start gap-3 h-auto py-3"
                >
                  <MessageCircle size={20} />
                  <span>Contactez-nous</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="justify-start gap-3 h-auto py-3"
                >
                  <Globe size={20} />
                  <span>FR / €</span>
                </Button>
                
                {isAdmin && (
                  <>
                    <Separator className="my-2" />
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-auto py-3"
                      onClick={() => navigate("/admin")}
                    >
                      <Shield size={20} />
                      <span>Administration</span>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
