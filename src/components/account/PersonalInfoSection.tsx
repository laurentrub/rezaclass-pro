import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  phone: z.string().min(10, "Le téléphone doit contenir au moins 10 caractères").max(20, "Le téléphone ne peut pas dépasser 20 caractères").optional().or(z.literal("")),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  newPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export const PersonalInfoSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!user) throw new Error("Non authentifié");
      
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name,
          phone: values.phone || null,
        })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profil mis à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du profil");
      console.error(error);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (values: PasswordFormValues) => {
      if (!user) throw new Error("Non authentifié");
      
      // First verify the current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile?.email || "",
        password: values.currentPassword,
      });

      if (signInError) {
        throw new Error("Mot de passe actuel incorrect");
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (error) throw error;

      // Send notification email
      await supabase.functions.invoke("send-password-change-notification", {
        body: {
          email: profile?.email,
          userName: profile?.full_name,
        },
      });
    },
    onSuccess: () => {
      toast.success("Mot de passe modifié avec succès. Un email de confirmation vous a été envoyé.");
      passwordForm.reset();
      setShowPasswordForm(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la modification du mot de passe");
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  const onPasswordSubmit = (values: PasswordFormValues) => {
    updatePasswordMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Modifiez vos informations personnelles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      value={profile?.email || ""} 
                      disabled 
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    L'adresse email ne peut pas être modifiée
                  </p>
                </FormItem>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="06 12 34 56 78" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Gérez votre mot de passe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
              Changer mon mot de passe
            </Button>
          ) : (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe actuel</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={updatePasswordMutation.isPending}>
                    {updatePasswordMutation.isPending ? "Modification..." : "Modifier le mot de passe"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => {
                      setShowPasswordForm(false);
                      passwordForm.reset();
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};