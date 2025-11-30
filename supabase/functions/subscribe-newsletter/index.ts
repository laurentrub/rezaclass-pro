import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@4.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { email } = await req.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      console.error('Invalid email format:', email);
      return new Response(
        JSON.stringify({ error: 'Adresse email invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing email:', checkError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la vérification de l\'email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existing) {
      console.log('Email already subscribed:', email);
      return new Response(
        JSON.stringify({ error: 'Cet email est déjà inscrit à notre newsletter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, subscribed: true });

    if (insertError) {
      console.error('Error inserting subscriber:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'inscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully subscribed email:', email);

    // Send confirmation email
    try {
      const emailResponse = await resend.emails.send({
        from: 'VacancesFrance <onboarding@resend.dev>',
        to: [email],
        subject: 'Bienvenue à VacancesFrance - Confirmation d\'inscription',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0066CC 0%, #004C99 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; padding: 12px 30px; background: #0066CC; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                h1 { margin: 0; font-size: 28px; }
                p { margin: 16px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🏖️ Bienvenue à VacancesFrance !</h1>
                </div>
                <div class="content">
                  <p>Bonjour,</p>
                  <p>Merci de vous être inscrit à notre newsletter ! Nous sommes ravis de vous compter parmi nous.</p>
                  <p>Vous recevrez désormais en exclusivité :</p>
                  <ul>
                    <li>✨ Nos meilleures offres de locations saisonnières</li>
                    <li>🏡 Les nouveaux biens disponibles en avant-première</li>
                    <li>💡 Nos conseils et astuces pour des vacances réussies</li>
                    <li>🎁 Des promotions exclusives réservées à nos abonnés</li>
                  </ul>
                  <p style="text-align: center;">
                    <a href="${Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'https://votre-site.com'}" class="button">
                      Découvrir nos locations
                    </a>
                  </p>
                  <p>À très bientôt pour de belles découvertes !</p>
                  <p style="margin-top: 30px;">
                    L'équipe VacancesFrance
                  </p>
                </div>
                <div class="footer">
                  <p>Vous recevez cet email car vous vous êtes inscrit à notre newsletter.</p>
                  <p>VacancesFrance - Votre partenaire de confiance pour des vacances exceptionnelles en France</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log('Confirmation email sent successfully:', emailResponse);
    } catch (emailError) {
      // Log the error but don't fail the subscription
      console.error('Error sending confirmation email:', emailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Inscription réussie ! Vous recevrez bientôt nos meilleures offres.' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in subscribe-newsletter:', error);
    return new Response(
      JSON.stringify({ error: 'Une erreur inattendue est survenue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
