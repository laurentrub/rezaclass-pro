import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentProofNotificationRequest {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  propertyTitle: string;
  checkInDate: string;
  totalPrice: number;
  paymentProofUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      bookingId,
      customerName,
      customerEmail,
      propertyTitle,
      checkInDate,
      totalPrice,
      paymentProofUrl,
    }: PaymentProofNotificationRequest = await req.json();

    console.log("Sending payment proof notification to admin for booking:", bookingId);

    const emailResponse = await resend.emails.send({
      from: "Rezaclass <noreply@rezaclass.fr>",
      to: ["contact@rezaclass.fr"],
      subject: `🔔 Nouveau justificatif de paiement reçu - Réservation #${bookingId.slice(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
              }
              .container {
                background-color: #ffffff;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #2563eb;
              }
              .header h1 {
                color: #2563eb;
                font-size: 24px;
                margin: 0;
              }
              .alert-box {
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .info-section {
                margin: 25px 0;
                padding: 20px;
                background-color: #f8fafc;
                border-radius: 8px;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #e2e8f0;
              }
              .info-row:last-child {
                border-bottom: none;
              }
              .label {
                font-weight: 600;
                color: #64748b;
              }
              .value {
                color: #1e293b;
                font-weight: 500;
              }
              .cta-button {
                display: inline-block;
                background-color: #2563eb;
                color: #ffffff !important;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 25px auto;
                text-align: center;
              }
              .cta-container {
                text-align: center;
                margin: 30px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                color: #64748b;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 Nouveau justificatif de paiement</h1>
              </div>

              <div class="alert-box">
                <strong>Action requise :</strong> Un client vient d'envoyer un justificatif de paiement qui nécessite votre validation.
              </div>

              <div class="info-section">
                <h3 style="margin-top: 0; color: #1e293b;">Informations de la réservation</h3>
                
                <div class="info-row">
                  <span class="label">ID Réservation:</span>
                  <span class="value">#${bookingId.slice(0, 8)}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Client:</span>
                  <span class="value">${customerName}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span class="value">${customerEmail}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Propriété:</span>
                  <span class="value">${propertyTitle}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Date d'arrivée:</span>
                  <span class="value">${new Date(checkInDate).toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Montant total:</span>
                  <span class="value">${totalPrice.toFixed(2)} €</span>
                </div>
              </div>

              <div class="cta-container">
                <a href="${Deno.env.get('VITE_SUPABASE_URL')?.replace('/rest/v1', '') || 'http://localhost:8080'}/admin" class="cta-button">
                  📋 Voir dans le dashboard admin
                </a>
              </div>

              <p style="color: #64748b; font-size: 14px; text-align: center;">
                Le justificatif est disponible dans le dashboard admin. Vérifiez le paiement et confirmez la réservation.
              </p>

              <div class="footer">
                <p>Cet email a été envoyé automatiquement par le système de gestion des réservations.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Admin notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-payment-proof-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
