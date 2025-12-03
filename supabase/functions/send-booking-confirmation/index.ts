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

    // Fetch booking details with property information including owner_id
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        properties (
          title,
          location,
          owner_id
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError);
      throw bookingError ?? new Error("Booking not found");
    }

    // Fetch property owner bank details
    let ownerName = "Rezaclass";
    let ownerIban = "Non disponible";
    let ownerBic = "Non disponible";

    if (booking.properties?.owner_id) {
      const { data: owner, error: ownerError } = await supabase
        .from("property_owners")
        .select("name, bank_details")
        .eq("id", booking.properties.owner_id)
        .single();

      if (!ownerError && owner) {
        ownerName = owner.name || "Rezaclass";
        const bankDetails = owner.bank_details as { iban?: string; bic?: string } | null;
        ownerIban = bankDetails?.iban || "Non disponible";
        ownerBic = bankDetails?.bic || "Non disponible";
      }
    }

    console.log("Owner bank details fetched:", { ownerName, hasIban: ownerIban !== "Non disponible" });

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

<<<<<<< HEAD
    // 👉 nouvelle façon de construire l'URL front : plus de .lovableproject.com
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://rezaclass.fr";
=======
    const frontendUrl = Deno.env.get("FRONTEND_URL") || Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovableproject.com') || '';
>>>>>>> dev

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
            .cta-button { display: inline-block; padding: 15px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .status-badge { display: inline-block; padding: 8px 16px; background-color: #fbbf24; color: #78350f; border-radius: 20px; font-weight: bold; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Confirmation de Réception de Réservation</h1>
              <div style="margin-top: 10px;">
                <span class="status-badge">⏳ EN ATTENTE DE PAIEMENT</span>
              </div>
            </div>
            
            <div class="content">
              <p>Bonjour ${userName},</p>
              
              <p><strong>Merci pour votre réservation !</strong> Nous avons bien reçu votre demande et celle-ci est actuellement <strong>en attente de confirmation de paiement</strong>.</p>
              
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
                <h3 style="margin-top: 0; color: #f59e0b;">💳 ÉTAPE 1 : Effectuer le virement bancaire</h3>
                <p><strong>Pour finaliser votre réservation, veuillez effectuer un virement bancaire avec les informations suivantes :</strong></p>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 2px solid #f59e0b;">
                  <p style="margin: 8px 0; font-size: 15px;"><strong>Titulaire du compte :</strong> ${ownerName}</p>
                  <p style="margin: 8px 0; font-size: 15px;"><strong>IBAN :</strong> ${ownerIban}</p>
                  <p style="margin: 8px 0; font-size: 15px;"><strong>BIC :</strong> ${ownerBic}</p>
                  <p style="margin: 8px 0; font-size: 16px;"><strong>Montant à virer :</strong> <span style="color: #2563eb; font-size: 18px;">${booking.total_price}€</span></p>
                  <p style="margin: 8px 0; font-size: 15px;"><strong>Référence obligatoire :</strong> <span style="background-color: #fef3c7; padding: 4px 8px; border-radius: 4px;">${bookingRef}</span></p>
                </div>
                
                <p style="margin: 15px 0; font-size: 14px; background-color: #fee2e2; padding: 12px; border-radius: 6px; border-left: 4px solid #dc2626;">
                  <strong>⚠️ Très important :</strong> N'oubliez surtout pas d'indiquer la référence <strong>${bookingRef}</strong> dans le libellé de votre virement. Sans cette référence, nous ne pourrons pas identifier votre paiement !
                </p>

                <h3 style="margin-top: 20px; color: #f59e0b;">📤 ÉTAPE 2 : Envoyer votre justificatif de paiement</h3>
                <p>Après avoir effectué le virement, envoyez-nous votre justificatif bancaire (capture d'écran ou PDF) pour accélérer la validation de votre réservation :</p>
                
                <div style="text-align: center; margin: 25px 0;">
                  <a href="${frontendUrl}/mon-compte?booking=${bookingId}" class="cta-button" style="color: white;">
                    📎 Envoyer ma preuve de paiement
                  </a>
                </div>
                
                <p style="font-size: 13px; color: #6b7280; text-align: center;">
                  Vous pouvez également envoyer votre justificatif depuis votre espace personnel à tout moment.
                </p>
              </div>
              
              ${booking.special_requests ? `
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Demandes spéciales</h3>
                  <p>${booking.special_requests}</p>
                </div>
              ` : ''}
              
              <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                <h3 style="margin-top: 0; color: #1e40af;">📋 Prochaines étapes</h3>
                <ol style="margin: 10px 0; padding-left: 20px;">
                  <li style="margin: 8px 0;">Effectuez le virement bancaire avec la référence ${bookingRef}</li>
                  <li style="margin: 8px 0;">Envoyez votre justificatif de paiement via le bouton ci-dessus</li>
                  <li style="margin: 8px 0;">Nous validerons votre paiement sous 24-48h</li>
                  <li style="margin: 8px 0;">Vous recevrez une confirmation finale par email</li>
                </ol>
              </div>
              
              <p>Vous pouvez retrouver toutes vos réservations et gérer vos justificatifs dans <a href="${frontendUrl}/mon-compte" style="color: #2563eb;">votre espace personnel</a>.</p>
              
              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
              
              <p>À très bientôt,<br><strong>L'équipe Rezaclass</strong></p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              <p>Pour toute question, contactez-nous à support@rezaclass.fr</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({

      from: "RezaClass <noreply@rezaclass.fr>",
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
