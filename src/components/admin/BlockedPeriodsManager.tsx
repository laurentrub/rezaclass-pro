import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Plus, Pencil, Trash2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";

const blockedPeriodSchema = z.object({
  property_id: z.string().uuid({ message: "Propriété requise" }),
  start_date: z.date({ required_error: "Date de début requise" }),
  end_date: z.date({ required_error: "Date de fin requise" }),
  reason: z.string().max(500, { message: "La raison doit faire moins de 500 caractères" }).optional(),
}).refine((data) => data.end_date >= data.start_date, {
  message: "La date de fin doit être après ou égale à la date de début",
  path: ["end_date"],
});

type BlockedPeriodForm = z.infer<typeof blockedPeriodSchema>;

interface BlockedPeriod {
  id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  properties?: {
    title: string;
  };
}

export const BlockedPeriodsManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<BlockedPeriod | null>(null);
  const [formData, setFormData] = useState<Partial<BlockedPeriodForm>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof BlockedPeriodForm, string>>>({});

  // Fetch properties for dropdown
  const { data: properties } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title")
        .order("title");

      if (error) throw error;
      return data;
    },
  });

  // Fetch blocked periods
  const { data: blockedPeriods, isLoading } = useQuery({
    queryKey: ["admin-blocked-periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_periods")
        .select(`
          *,
          properties (title)
        `)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data as BlockedPeriod[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: BlockedPeriodForm) => {
      const { error } = await supabase
        .from("blocked_periods")
        .insert({
          property_id: data.property_id,
          start_date: format(data.start_date, "yyyy-MM-dd"),
          end_date: format(data.end_date, "yyyy-MM-dd"),
          reason: data.reason || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blocked-periods"] });
      toast.success("Période bloquée ajoutée avec succès");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BlockedPeriodForm }) => {
      const { error } = await supabase
        .from("blocked_periods")
        .update({
          property_id: data.property_id,
          start_date: format(data.start_date, "yyyy-MM-dd"),
          end_date: format(data.end_date, "yyyy-MM-dd"),
          reason: data.reason || null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blocked-periods"] });
      toast.success("Période bloquée modifiée avec succès");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blocked_periods")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blocked-periods"] });
      toast.success("Période bloquée supprimée avec succès");
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({});
    setEditingPeriod(null);
    setIsDialogOpen(false);
    setErrors({});
  };

  const handleEdit = (period: BlockedPeriod) => {
    setEditingPeriod(period);
    setFormData({
      property_id: period.property_id,
      start_date: new Date(period.start_date),
      end_date: new Date(period.end_date),
      reason: period.reason || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    setErrors({});

    const result = blockedPeriodSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BlockedPeriodForm, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof BlockedPeriodForm;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (editingPeriod) {
      updateMutation.mutate({ id: editingPeriod.id, data: result.data });
    } else {
      createMutation.mutate(result.data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette période bloquée ?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Périodes bloquées</h2>
          <p className="text-muted-foreground">
            Gérez les périodes d'indisponibilité des propriétés
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une période
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPeriod ? "Modifier" : "Ajouter"} une période bloquée
              </DialogTitle>
              <DialogDescription>
                Définissez les dates pendant lesquelles une propriété sera indisponible
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="property">Propriété *</Label>
                <Select
                  value={formData.property_id}
                  onValueChange={(value) => setFormData({ ...formData, property_id: value })}
                >
                  <SelectTrigger className={errors.property_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionnez une propriété" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties?.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.property_id && (
                  <p className="text-sm text-destructive">{errors.property_id}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de début *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.start_date && "text-muted-foreground",
                          errors.start_date && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.start_date ? (
                          format(formData.start_date, "d MMMM yyyy", { locale: fr })
                        ) : (
                          "Sélectionner"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.start_date}
                        onSelect={(date) => setFormData({ ...formData, start_date: date })}
                        locale={fr}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.start_date && (
                    <p className="text-sm text-destructive">{errors.start_date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Date de fin *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.end_date && "text-muted-foreground",
                          errors.end_date && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? (
                          format(formData.end_date, "d MMMM yyyy", { locale: fr })
                        ) : (
                          "Sélectionner"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.end_date}
                        onSelect={(date) => setFormData({ ...formData, end_date: date })}
                        disabled={(date) =>
                          formData.start_date ? date < formData.start_date : false
                        }
                        locale={fr}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.end_date && (
                    <p className="text-sm text-destructive">{errors.end_date}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Raison (optionnel)</Label>
                <Textarea
                  id="reason"
                  value={formData.reason || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Ex: Travaux de rénovation, maintenance, période personnelle..."
                  rows={3}
                  maxLength={500}
                  className={errors.reason ? "border-destructive" : ""}
                />
                {errors.reason && (
                  <p className="text-sm text-destructive">{errors.reason}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {(formData.reason?.length || 0)}/500 caractères
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingPeriod ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Liste des périodes bloquées
          </CardTitle>
          <CardDescription>
            {blockedPeriods?.length || 0} période(s) bloquée(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : blockedPeriods && blockedPeriods.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Propriété</TableHead>
                    <TableHead>Date de début</TableHead>
                    <TableHead>Date de fin</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedPeriods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell className="font-medium">
                        {period.properties?.title || "Propriété inconnue"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(period.start_date), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(period.end_date), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        {period.reason ? (
                          <span className="text-sm text-muted-foreground">
                            {period.reason.length > 50
                              ? `${period.reason.substring(0, 50)}...`
                              : period.reason}
                          </span>
                        ) : (
                          <Badge variant="outline">Non spécifiée</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(period)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(period.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Ban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucune période bloquée
              </h3>
              <p className="text-muted-foreground mb-4">
                Commencez par ajouter une période d'indisponibilité
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une période
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
