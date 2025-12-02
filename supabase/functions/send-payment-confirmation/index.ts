import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentConfirmationRequest {
  bookingId: string;
  customerEmail: string;
  customerName: string;
  propertyTitle: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
}

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
    }: PaymentConfirmationRequest = await req.json();

    console.log("Sending payment confirmation to:", customerEmail);

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
              background: linear-gradient(135deg, #2B6CB0 0%, #3182CE 100%);
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
            .success-badge {
              background: #48BB78;
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
              border-left: 4px solid #3182CE;
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
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Paiement Confirmé !</h1>
          </div>
          
          <div class="content">
            <p>Bonjour ${customerName},</p>
            
            <div class="success-badge">
              ✓ Paiement validé
            </div>
            
            <p>
              Excellente nouvelle ! Nous avons vérifié et confirmé votre paiement. 
              Votre réservation est maintenant <strong>officiellement confirmée</strong>.
            </p>

            <div class="booking-details">
              <h3 style="margin-top: 0; color: #2B6CB0;">📋 Détails de votre réservation</h3>
              
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
                <span class="label">Montant payé :</span>
                <span class="value" style="font-weight: bold; color: #48BB78;">${totalPrice.toFixed(2)} €</span>
              </div>
            </div>

            <h3 style="color: #2B6CB0;">📍 Prochaines étapes</h3>
            <ul style="color: #4A5568;">
              <li>Vous recevrez les informations d'accès à la propriété <strong>3 jours avant votre arrivée</strong></li>
              <li>En cas de questions, n'hésitez pas à nous contacter</li>
              <li>Nous vous enverrons un rappel quelques jours avant votre séjour</li>
            </ul>

            <p style="margin-top: 30px;">
              Nous vous souhaitons un excellent séjour ! ✨
            </p>

            <p style="margin-top: 20px;">
              Cordialement,<br>
              <strong>L'équipe Rezaclass</strong>
            </p>
          </div>

          <div class="footer">
            <p>
              Cet email a été envoyé pour confirmer votre réservation.<br>
              Pour toute question, contactez-nous à support@rezaclass.fr
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Rezaclass <noreply@rezaclass.fr>",
      to: [customerEmail],
      subject: "✅ Votre paiement a été confirmé - Réservation validée",
      html: emailHtml,
    });

    console.log("Payment confirmation email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-payment-confirmation function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
