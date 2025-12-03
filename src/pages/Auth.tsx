import { useState } from "react";
import { Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";

const Auth = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message === "Invalid login credentials" 
          ? "Email ou mot de passe incorrect" 
          : error.message,
      });
    } else {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });
    }
    
    setLoading(false);
  };

  // Validation du numéro de téléphone européen
  const validateEuropeanPhone = (phone: string): boolean => {
    // Nettoyer le numéro (enlever espaces, tirets, points)
    const cleanPhone = phone.replace(/[\s\-\.]/g, '');
    
    // Formats européens acceptés:
    // +33612345678 (France)
    // 0033612345678 (France avec 00)
    // 0612345678 (France local)
    // +49123456789 (Allemagne)
    // +34612345678 (Espagne)
    // +39312345678 (Italie)
    // +44712345678 (UK)
    // +32412345678 (Belgique)
    // +31612345678 (Pays-Bas)
    // +41791234567 (Suisse)
    // +351912345678 (Portugal)
    // +43612345678 (Autriche)
    // +352621234567 (Luxembourg)
    // +377612345678 (Monaco)
    // +376312345 (Andorre)
    
    const europeanPhoneRegex = /^(\+|00)?(33|49|34|39|44|32|31|41|351|43|352|377|376|30|353|358|45|46|47|48|420|421|36|40|359|370|371|372|386|385|381|382|383|355|389|373|380|375|7)[0-9]{6,12}$|^0[1-9][0-9]{8}$/;
    
    return europeanPhoneRegex.test(cleanPhone);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (signupPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
      });
      setLoading(false);
      return;
    }

    if (!validateEuropeanPhone(signupPhone)) {
      toast({
        variant: "destructive",
        title: "Numéro invalide",
        description: "Veuillez entrer un numéro de téléphone européen valide (ex: +33 6 12 34 56 78)",
      });
      setLoading(false);
      return;
    }
    
    const { error } = await signUp(signupEmail, signupPassword, signupName, signupPhone);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message === "User already registered" 
          ? "Cet email est déjà utilisé" 
          : error.message,
      });
    } else {
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès !",
      });
      navigate("/");
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!loginEmail) {
      toast({
        variant: "destructive",
        title: "Email requis",
        description: "Veuillez entrer votre adresse email",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } else {
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <a href="/" className="flex items-center justify-center gap-2 mb-8">
            <Home className="text-primary" size={32} />
            <span className="text-3xl font-bold text-foreground">Rezaclass</span>
          </a>
          <Card>
          <CardHeader>
            <CardTitle>Bienvenue</CardTitle>
            <CardDescription>
              Connectez-vous ou créez un compte pour réserver
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Connexion..." : "Se connecter"}
                  </Button>
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-primary hover:underline"
                      disabled={loading}
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nom complet *</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Jean Dupont"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Téléphone *</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Minimum 6 caractères"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Inscription..." : "S'inscrire"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
