import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordChangeRequest {
  email: string;
  userName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userName }: PasswordChangeRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Rezaclass <noreply@rezaclass.fr>",
      to: [email],
      subject: "Votre mot de passe a été modifié",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Rezaclass</h1>
            </div>
            
            <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background-color: #fef3c7; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 30px;">🔐</span>
                </div>
                <h2 style="color: #1e3a5f; margin: 0 0 10px; font-size: 22px;">Mot de passe modifié</h2>
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Bonjour ${userName || 'cher client'},
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Nous vous informons que le mot de passe de votre compte Rezaclass a été modifié avec succès.
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  <strong>⚠️ Si vous n'êtes pas à l'origine de cette modification</strong>, veuillez nous contacter immédiatement à <a href="mailto:support@rezaclass.fr" style="color: #1e3a5f;">support@rezaclass.fr</a>
                </p>
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Cordialement,<br>
                <strong>L'équipe Rezaclass</strong>
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
              <p style="margin: 0 0 10px;">© 2024 Rezaclass. Tous droits réservés.</p>
              <p style="margin: 0;">
                <a href="https://rezaclass.fr" style="color: #1e3a5f; text-decoration: none;">rezaclass.fr</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Password change notification sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-password-change-notification:", error);
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
