import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Upload, FileText, Check } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PaymentProofUploadProps {
  bookingId: string;
  onUploadComplete: () => void;
}

export const PaymentProofUpload = ({ bookingId, onUploadComplete }: PaymentProofUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error("Format de fichier non valide. Utilisez JPG, PNG ou PDF.");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux. Maximum 5 MB.");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${bookingId}-${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Update booking with proof URL and change status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          payment_proof_url: publicUrl,
          payment_status: 'proof_submitted'
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Send notification to admin
      try {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('*, properties(title)')
          .eq('id', bookingId)
          .single();

        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();

        if (bookingData) {
          await supabase.functions.invoke('send-payment-proof-notification', {
            body: {
              bookingId: bookingData.id,
              customerName: profileData?.full_name || 'Client',
              customerEmail: profileData?.email || '',
              propertyTitle: bookingData.properties?.title || '',
              checkInDate: bookingData.check_in_date,
              totalPrice: bookingData.total_price,
              paymentProofUrl: publicUrl,
            },
          });
        }
      } catch (notifError) {
        console.error('Error sending admin notification:', notifError);
        // Don't throw - the upload was successful even if notification failed
      }

      toast.success("Justificatif envoyé avec succès ! Nous validerons votre paiement sous 24-48h.");
      setSelectedFile(null);
      onUploadComplete();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error("Erreur lors de l'envoi du justificatif");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Upload className="w-5 h-5 text-blue-600 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">
              Envoyez votre justificatif de paiement
            </h4>
            <p className="text-sm text-blue-700 mb-3">
              Pour accélérer la validation de votre réservation, envoyez-nous une capture d'écran ou un PDF de votre virement bancaire.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="payment-proof" className="text-sm font-medium">
            Sélectionner un fichier (JPG, PNG ou PDF - Max 5 MB)
          </Label>
          <Input
            id="payment-proof"
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="cursor-pointer"
          />
          
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-blue-700 bg-white p-2 rounded border border-blue-200">
              <FileText className="w-4 h-4" />
              <span>{selectedFile.name}</span>
              <Check className="w-4 h-4 ml-auto text-green-600" />
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading ? "Envoi en cours..." : "📤 Envoyer le justificatif"}
          </Button>
        </div>

        <p className="text-xs text-blue-600">
          💡 Une fois votre justificatif validé, le statut de votre réservation passera à "Confirmée" et vous recevrez un email de confirmation.
        </p>
      </div>
    </Card>
  );
};