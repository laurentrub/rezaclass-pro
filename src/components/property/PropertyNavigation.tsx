import { Heart, User, Shield, Menu, MessageCircle, Globe, Check, ChevronLeft, HelpCircle, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useLocaleSettings, Language, Currency } from "@/hooks/useLocaleSettings";
import { ContactDialog } from "@/components/ContactDialog";
import { useState } from "react";

export const PropertyNavigation = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, currency, setLanguage, setCurrency } = useLocaleSettings();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  const languages: Language[] = ['FR', 'EN'];
  const currencies: Currency[] = ['€', '$', '£'];

  const handleBackToSearch = () => {
    // If there's a previous page in history and it's not the current page
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to search page
      navigate('/search');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Back to Search */}
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
              <img src={logo} alt="Rezaclass" className="h-10 w-auto" />
              <span className="text-2xl font-bold text-foreground hidden md:inline">Rezaclass</span>
            </a>
            
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground hidden sm:flex"
              onClick={handleBackToSearch}
            >
              <ChevronLeft size={20} />
              <span>Continuer la recherche</span>
            </Button>
            
            {/* Mobile: Icon only */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={handleBackToSearch}
            >
              <ChevronLeft size={20} />
            </Button>
          </div>
          
          {/* Right: Help + Menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground hidden md:flex"
              onClick={() => setShowContactDialog(true)}
            >
              <HelpCircle size={20} />
              <span>Obtenir de l'aide</span>
            </Button>
            
            {/* Mobile: Icon only */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowContactDialog(true)}
            >
              <HelpCircle size={20} />
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left flex items-center gap-2">
                  <img src={logo} alt="Rezaclass" className="h-8 w-auto" />
                  Menu
                </SheetTitle>
              </SheetHeader>
                
                <div className="flex flex-col gap-4 mt-6">
                  {user ? (
                    <>
                      <Button
                        variant="ghost"
                        className="justify-start gap-3 h-auto py-3"
                        onClick={() => navigate("/account")}
                      >
                        <User size={20} />
                        <span>Mon Compte</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start gap-3 h-auto py-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={signOut}
                      >
                        <LogOut size={20} />
                        <span>Se déconnecter</span>
                      </Button>
                    </>
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
                    onClick={() => setShowContactDialog(true)}
                  >
                    <MessageCircle size={20} />
                    <span>Contactez-nous</span>
                  </Button>
                  
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-auto py-3 w-full"
                      onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    >
                      <Globe size={20} />
                      <span>Langue: {language}</span>
                    </Button>
                    
                    {showLanguageMenu && (
                      <div className="ml-8 space-y-1">
                        {languages.map((lang) => (
                          <Button
                            key={lang}
                            variant="ghost"
                            size="sm"
                            className="justify-start gap-2 w-full"
                            onClick={() => {
                              setLanguage(lang);
                              setShowLanguageMenu(false);
                            }}
                          >
                            {language === lang && <Check size={16} />}
                            <span className={language === lang ? "font-medium" : ""}>
                              {lang}
                            </span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-auto py-3 w-full"
                      onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                    >
                      <Globe size={20} />
                      <span>Devise: {currency}</span>
                    </Button>
                    
                    {showCurrencyMenu && (
                      <div className="ml-8 space-y-1">
                        {currencies.map((curr) => (
                          <Button
                            key={curr}
                            variant="ghost"
                            size="sm"
                            className="justify-start gap-2 w-full"
                            onClick={() => {
                              setCurrency(curr);
                              setShowCurrencyMenu(false);
                            }}
                          >
                            {currency === curr && <Check size={16} />}
                            <span className={currency === curr ? "font-medium" : ""}>
                              {curr}
                            </span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
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
      </div>
      
      <ContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} />
    </nav>
  );
};