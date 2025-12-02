import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentStatusUpdateRequest {
  bookingId: string;
  customerEmail: string;
  customerName: string;
  propertyTitle: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  oldStatus: string;
  newStatus: string;
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: "En attente de paiement",
    proof_submitted: "Justificatif reçu",
    received: "Paiement confirmé",
    transferred_to_owner: "Paiement traité",
  };
  return labels[status] || status;
};

const getStatusMessage = (newStatus: string): { title: string; message: string; icon: string; color: string } => {
  switch (newStatus) {
    case "proof_submitted":
      return {
        title: "Justificatif de paiement reçu",
        message: "Nous avons bien reçu votre justificatif de paiement. Notre équipe va le vérifier dans les plus brefs délais.",
        icon: "📋",
        color: "#3182CE"
      };
    case "received":
      return {
        title: "Paiement confirmé !",
        message: "Excellente nouvelle ! Votre paiement a été vérifié et confirmé. Votre réservation est maintenant officiellement validée.",
        icon: "✅",
        color: "#48BB78"
      };
    case "transferred_to_owner":
      return {
        title: "Paiement traité",
        message: "Votre paiement a été traité avec succès. Tout est en ordre pour votre séjour !",
        icon: "🏠",
        color: "#805AD5"
      };
    default:
      return {
        title: "Mise à jour de votre réservation",
        message: "Le statut de votre paiement a été mis à jour.",
        icon: "ℹ️",
        color: "#718096"
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      bookingId,
      customerEmail,
      customerName,
      propertyTitle,
      checkInDate,
      checkOutDate,
      totalPrice,
      oldStatus,
      newStatus,
    }: PaymentStatusUpdateRequest = await req.json();

    console.log(`Sending payment status update email: ${oldStatus} -> ${newStatus} for booking ${bookingId}`);

    // Don't send email for pending status (initial state)
    if (newStatus === "pending") {
      console.log("Skipping email for pending status");
      return new Response(JSON.stringify({ skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const statusInfo = getStatusMessage(newStatus);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .status-badge {
              background: ${statusInfo.color};
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              display: inline-block;
              font-weight: bold;
              margin: 20px 0;
            }
            .booking-details {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid ${statusInfo.color};
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #2D3748;
            }
            .value {
              color: #4A5568;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #718096;
              font-size: 14px;
            }
            .cta-button {
              display: inline-block;
              background: ${statusInfo.color};
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: bold;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${statusInfo.icon} ${statusInfo.title}</h1>
          </div>
          
          <div class="content">
            <p>Bonjour ${customerName},</p>
            
            <div class="status-badge">
              ${getStatusLabel(newStatus)}
            </div>
            
            <p>${statusInfo.message}</p>

            <div class="booking-details">
              <h3 style="margin-top: 0; color: ${statusInfo.color};">📋 Récapitulatif de votre réservation</h3>
              
              <div class="detail-row">
                <span class="label">Numéro de réservation :</span>
                <span class="value">${bookingId.substring(0, 8).toUpperCase()}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Propriété :</span>
                <span class="value">${propertyTitle}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Arrivée :</span>
                <span class="value">${new Date(checkInDate).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Départ :</span>
                <span class="value">${new Date(checkOutDate).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Montant total :</span>
                <span class="value" style="font-weight: bold;">${totalPrice.toFixed(2)} €</span>
              </div>
            </div>

            <p style="margin-top: 30px;">
              Vous pouvez suivre l'état de votre réservation à tout moment depuis votre espace client.
            </p>

            <center>
              <a href="${Deno.env.get("FRONTEND_URL") || "https://rezaclass.fr"}/account" class="cta-button">
                Voir ma réservation
              </a>
            </center>

            <p style="margin-top: 30px;">
              Cordialement,<br>
              <strong>L'équipe Rezaclass</strong>
            </p>
          </div>

          <div class="footer">
            <p>
              Pour toute question, contactez-nous à support@rezaclass.fr
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Rezaclass <noreply@rezaclass.fr>",
      to: [customerEmail],
      subject: `${statusInfo.icon} ${statusInfo.title} - Réservation ${bookingId.substring(0, 8).toUpperCase()}`,
      html: emailHtml,
    });

    console.log("Payment status update email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-payment-status-update function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
