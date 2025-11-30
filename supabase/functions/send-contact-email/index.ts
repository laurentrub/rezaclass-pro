import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone: string;
  subject: "booking" | "host" | "other";
  message: string;
}

const subjectLabels = {
  booking: "Réservation en cours",
  host: "Devenir hôte",
  other: "Autres",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message }: ContactEmailRequest = await req.json();

    // Validate input
    if (!name || !email || !phone || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "VacancesFrance <onboarding@resend.dev>",
      to: [email],
      subject: "Nous avons reçu votre message",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            VacancesFrance
          </h1>
          <h2 style="color: #333;">Merci de nous avoir contacté, ${name} !</h2>
          <p style="color: #666; line-height: 1.6;">
            Nous avons bien reçu votre message concernant : <strong>${subjectLabels[subject]}</strong>
          </p>
          <p style="color: #666; line-height: 1.6;">
            Notre équipe vous répondra dans les plus brefs délais.
          </p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Récapitulatif de votre message :</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Sujet :</strong> ${subjectLabels[subject]}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Message :</strong></p>
            <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Cordialement,<br>
            L'équipe VacancesFrance
          </p>
        </div>
      `,
    });

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "VacancesFrance Contact Form <onboarding@resend.dev>",
      to: ["contact@vacancesfrance.com"], // Replace with your actual admin email
      subject: `Nouveau message : ${subjectLabels[subject]}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Nouveau message de contact</h1>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Nom :</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email :</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Téléphone :</strong> ${phone}</p>
            <p style="margin: 5px 0;"><strong>Sujet :</strong> ${subjectLabels[subject]}</p>
          </div>
          <div style="background-color: #fff; padding: 15px; border: 1px solid #e5e7eb; border-radius: 5px;">
            <h3 style="margin-top: 0;">Message :</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    });

    console.log("Emails sent successfully:", { userEmailResponse, adminEmailResponse });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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