import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  bookingId: string;
  userEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { bookingId, userEmail }: BookingConfirmationRequest = await req.json();

    console.log("Processing booking confirmation for:", bookingId);

    // Fetch booking details with property information
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        properties (
          title,
          location
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError) {
      console.error("Error fetching booking:", bookingError);
      throw bookingError;
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", booking.user_id)
      .single();

    const userName = profile?.full_name || "Client";
    const propertyTitle = booking.properties?.title || "Propriété";
    const propertyLocation = booking.properties?.location || "";
    const checkInDate = new Date(booking.check_in_date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const checkOutDate = new Date(booking.check_out_date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const bookingRef = `RES-${bookingId.slice(0, 8).toUpperCase()}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #f9fafb; }
            .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .bank-details { background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-label { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Confirmation de Réservation</h1>
            </div>
            
            <div class="content">
              <p>Bonjour ${userName},</p>
              
              <p>Nous avons bien reçu votre demande de réservation. Voici les détails :</p>
              
              <div class="booking-details">
                <h2 style="margin-top: 0;">${propertyTitle}</h2>
                <p style="color: #6b7280; margin: 5px 0;">${propertyLocation}</p>
                
                <div class="info-row">
                  <span class="info-label">Référence</span>
                  <span>${bookingRef}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">Arrivée</span>
                  <span>${checkInDate}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">Départ</span>
                  <span>${checkOutDate}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">Voyageurs</span>
                  <span>${booking.guests}</span>
                </div>
                
                <div class="info-row" style="border-bottom: none; font-size: 18px; font-weight: bold;">
                  <span>Montant Total</span>
                  <span>${booking.total_price}€</span>
                </div>
              </div>
              
              <div class="bank-details">
                <h3 style="margin-top: 0; color: #f59e0b;">⚠️ Informations de Paiement</h3>
                <p>Pour confirmer votre réservation, merci d'effectuer un virement bancaire avec les informations suivantes :</p>
                
                <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                  <p style="margin: 5px 0;"><strong>Titulaire du compte :</strong> Gîtes de France</p>
                  <p style="margin: 5px 0;"><strong>IBAN :</strong> FR76 1234 5678 9012 3456 7890 123</p>
                  <p style="margin: 5px 0;"><strong>BIC :</strong> BNPAFRPPXXX</p>
                  <p style="margin: 5px 0;"><strong>Montant :</strong> ${booking.total_price}€</p>
                  <p style="margin: 5px 0;"><strong>Référence à indiquer :</strong> ${bookingRef}</p>
                </div>
                
                <p style="margin: 10px 0; font-size: 14px;">
                  <strong>Important :</strong> N'oubliez pas d'indiquer la référence ${bookingRef} dans le libellé de votre virement pour que nous puissions identifier votre paiement.
                </p>
              </div>
              
              ${booking.special_requests ? `
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Demandes spéciales</h3>
                  <p>${booking.special_requests}</p>
                </div>
              ` : ''}
              
              <p>Dès réception de votre paiement, nous confirmerons définitivement votre réservation.</p>
              
              <p>Vous pouvez retrouver toutes vos réservations dans votre espace personnel sur notre site.</p>
              
              <p>À très bientôt,<br>L'équipe Gîte France</p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>Pour toute question, contactez-nous à contact@gitefrance.fr</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Gîte France <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Confirmation de réservation - ${propertyTitle}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
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
