import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100, "Le nom est trop long"),
  email: z.string().trim().email("Email invalide").max(255, "L'email est trop long"),
  phone: z.string().trim().min(1, "Le téléphone est requis").max(20, "Le numéro est trop long"),
  subject: z.enum(["booking", "host", "other"], {
    required_error: "Veuillez sélectionner un sujet",
  }),
  message: z.string().trim().min(1, "Le message est requis").max(2000, "Le message est trop long"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: undefined,
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: data,
      });

      if (error) throw error;

      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });

      setIsSuccess(true);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectLabels = {
    booking: "Réservation en cours",
    host: "Devenir hôte",
    other: "Autres",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-4">Nous Contacter</h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
          Notre équipe est à votre disposition pour répondre à toutes vos questions. 
          N'hésitez pas à nous contacter, nous serons ravis de vous aider.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="bg-card rounded-xl p-8 border border-border">
              <h2 className="text-2xl font-semibold text-card-foreground mb-2">Envoyez-nous un Message</h2>
              <p className="text-muted-foreground mb-6">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
              </p>

              {isSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Message envoyé avec succès !</p>
                    <p className="text-sm text-green-700">Nous vous répondrons dans les plus brefs délais.</p>
                  </div>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jean.dupont@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone *</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+33 6 12 34 56 78" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objet *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un sujet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="booking">{subjectLabels.booking}</SelectItem>
                            <SelectItem value="host">{subjectLabels.host}</SelectItem>
                            <SelectItem value="other">{subjectLabels.other}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez votre demande en détail..."
                            className="min-h-[150px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-card-foreground mb-4">Questions Fréquentes</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>• Pour une réservation en cours, consultez votre espace client</li>
                <li>• Pour devenir hôte, sélectionnez le sujet approprié</li>
                <li>• Réponse sous 48h pour les réclamations</li>
                <li>• Urgence durant votre séjour : contactez votre hôte</li>
              </ul>
            </div>

            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-3">Besoin d'aide rapide ?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pour une réponse immédiate, consultez notre centre d'aide ou votre espace client.
              </p>
              <Button variant="outline" className="w-full" size="sm">
                Centre d'aide
              </Button>
            </div>
          </div>
        </div>

        <section className="bg-card rounded-xl p-8 border border-border">
          <h2 className="text-2xl font-semibold text-card-foreground mb-4">Support et Assistance</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">Avant la Réservation</h3>
              <p className="text-sm text-muted-foreground">
                Questions sur une propriété, disponibilités, tarifs, conditions d'annulation
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">Pendant votre Séjour</h3>
              <p className="text-sm text-muted-foreground">
                Assistance d'urgence 24/7, problèmes techniques, questions sur la propriété
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground mb-2">Après votre Séjour</h3>
              <p className="text-sm text-muted-foreground">
                Avis, réclamations, remboursements, questions sur votre facture
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
