import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle } from "lucide-react";

const NewsletterPreferences = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  
  const email = searchParams.get("email");

  const handleUnsubscribe = async () => {
    if (!email) {
      toast({
        title: "Erreur",
        description: "Email manquant dans l'URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke("unsubscribe-newsletter", {
        body: { email },
      });

      if (error) throw error;

      setIsUnsubscribed(true);
      toast({
        title: "Désinscription réussie",
        description: "Vous ne recevrez plus nos emails de newsletter.",
      });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la désinscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Lien invalide</CardTitle>
            <CardDescription>
              Le lien de préférences newsletter est invalide ou incomplet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isUnsubscribed ? (
            <>
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Désinscription confirmée</CardTitle>
              <CardDescription>
                Vous avez été désinscrit de notre newsletter avec succès.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Préférences Newsletter</CardTitle>
              <CardDescription>
                Gérez votre abonnement à la newsletter Rezaclass
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Email</p>
            <p className="font-medium">{email}</p>
          </div>

          {isUnsubscribed ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Vous ne recevrez plus nos emails de newsletter. Vous pouvez vous réinscrire à tout moment depuis notre site.
              </p>
              <Button onClick={() => navigate("/")} className="w-full">
                Retour à l'accueil
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Vous recevez actuellement :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Nos meilleures offres de locations</li>
                  <li>Les nouveaux biens en avant-première</li>
                  <li>Nos conseils et astuces</li>
                  <li>Des promotions exclusives</li>
                </ul>
              </div>

              <Button
                onClick={handleUnsubscribe}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Désinscription en cours...
                  </>
                ) : (
                  "Me désinscrire de la newsletter"
                )}
              </Button>

              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full"
              >
                Annuler
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterPreferences;
