import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting booking reminders check...");

    // Calculate date 7 days from now
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 7);
    const reminderDateString = reminderDate.toISOString().split('T')[0];

    console.log("Looking for bookings with check-in date:", reminderDateString);

    // Fetch bookings with check-in date in 7 days
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        *,
        properties (
          title,
          location,
          address,
          check_in_time,
          image_url
        )
      `)
      .eq("check_in_date", reminderDateString)
      .eq("status", "confirmed")
      .eq("payment_status", "paid");

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      throw bookingsError;
    }

    if (!bookings || bookings.length === 0) {
      console.log("No bookings found for reminder date");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No bookings to remind",
          count: 0 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${bookings.length} booking(s) to remind`);

    const emailResults = [];

    // Send reminder email for each booking
    for (const booking of bookings) {
      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", booking.user_id)
          .single();

        if (!profile?.email) {
          console.error(`No email found for user ${booking.user_id}`);
          continue;
        }

        const userName = profile.full_name || "Voyageur";
        const propertyTitle = booking.properties?.title || "Votre location";
        const propertyLocation = booking.properties?.location || "";
        const propertyAddress = booking.properties?.address || "";
        const checkInTime = booking.properties?.check_in_time || "16:00";
        const propertyImage = booking.properties?.image_url || "";
        
        const checkInDate = new Date(booking.check_in_date).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        const checkOutDate = new Date(booking.check_out_date).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        const bookingRef = `RES-${booking.id.slice(0, 8).toUpperCase()}`;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-top: none; }
                .property-card { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
                .info-box { background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bfdbfe; }
                .checklist { background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                .info-row { display: flex; justify-content: space-between; padding: 8px 0; }
                .info-label { font-weight: bold; color: #4b5563; }
                .highlight { background-color: #fef3c7; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
                .btn { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                ul { padding-left: 20px; }
                li { margin: 8px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 28px;">🏡 Votre séjour approche !</h1>
                  <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Dans 7 jours, votre aventure commence</p>
                </div>
                
                <div class="content">
                  <p style="font-size: 18px; margin-top: 0;">Bonjour ${userName},</p>
                  
                  <p>Nous avons hâte de vous accueillir ! Votre séjour commence <span class="highlight">dans 7 jours</span>.</p>
                  
                  <div class="property-card">
                    ${propertyImage ? `<img src="${propertyImage}" alt="${propertyTitle}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 6px; margin-bottom: 15px;">` : ''}
                    <h2 style="margin-top: 0; color: #2563eb;">${propertyTitle}</h2>
                    <p style="color: #6b7280; margin: 5px 0;">📍 ${propertyLocation}</p>
                    ${propertyAddress ? `<p style="color: #6b7280; margin: 5px 0; font-size: 14px;">${propertyAddress}</p>` : ''}
                    
                    <div class="info-row">
                      <span class="info-label">Référence</span>
                      <span>${bookingRef}</span>
                    </div>
                    
                    <div class="info-row">
                      <span class="info-label">Arrivée</span>
                      <span>${checkInDate} à ${checkInTime}</span>
                    </div>
                    
                    <div class="info-row">
                      <span class="info-label">Départ</span>
                      <span>${checkOutDate}</span>
                    </div>
                    
                    <div class="info-row">
                      <span class="info-label">Voyageurs</span>
                      <span>${booking.guests} personne(s)</span>
                    </div>
                  </div>
                  
                  <div class="checklist">
                    <h3 style="margin-top: 0; color: #065f46;">✅ Checklist avant le départ</h3>
                    <ul style="margin: 10px 0;">
                      <li>Vérifiez vos documents d'identité</li>
                      <li>Préparez votre confirmation de réservation (réf: ${bookingRef})</li>
                      <li>Vérifiez les horaires d'arrivée : ${checkInTime}</li>
                      <li>Préparez vos moyens de paiement pour la caution</li>
                      <li>Consultez la météo de ${propertyLocation}</li>
                    </ul>
                  </div>
                  
                  <div class="info-box">
                    <h3 style="margin-top: 0; color: #1e40af;">ℹ️ Informations importantes</h3>
                    <p style="margin: 8px 0;"><strong>Heure d'arrivée :</strong> À partir de ${checkInTime}</p>
                    <p style="margin: 8px 0;"><strong>Contact en cas d'urgence :</strong> +33 6 12 34 56 78</p>
                    <p style="margin: 8px 0; font-size: 14px; color: #6b7280;">
                      Si vous avez besoin de modifier l'heure d'arrivée ou si vous avez des questions, n'hésitez pas à nous contacter.
                    </p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://rezaclass.com/account" class="btn">Voir ma réservation</a>
                  </div>
                  
                  <p>Nous vous souhaitons un excellent séjour !</p>
                  
                  <p style="margin-top: 30px;">
                    Cordialement,<br>
                    <strong>L'équipe Rezaclass</strong>
                  </p>
                </div>
                
                <div class="footer">
                  <p>Cet email a été envoyé automatiquement concernant votre réservation ${bookingRef}</p>
                  <p>Pour toute question, contactez-nous à contact@rezaclass.com</p>
                </div>
              </div>
            </body>
          </html>
        `;

        const emailResponse = await resend.emails.send({
          from: "Rezaclass <onboarding@resend.dev>",
          to: [profile.email],
          subject: `🏡 Votre séjour commence dans 7 jours - ${propertyTitle}`,
          html: emailHtml,
        });

        console.log(`Reminder email sent to ${profile.email} for booking ${booking.id}`);
        emailResults.push({
          booking_id: booking.id,
          user_email: profile.email,
          status: "sent",
        });
      } catch (emailError: any) {
        console.error(`Error sending reminder for booking ${booking.id}:`, emailError);
        emailResults.push({
          booking_id: booking.id,
          status: "failed",
          error: emailError.message,
        });
      }
    }

    console.log("Booking reminders completed:", emailResults);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${emailResults.filter(r => r.status === "sent").length} reminder(s)`,
        total_bookings: bookings.length,
        results: emailResults,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-reminders function:", error);
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