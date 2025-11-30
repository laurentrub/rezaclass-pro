import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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

    // Check if email exists
    const { data: existing, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('email, subscribed')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking email:', checkError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la vérification de l\'email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!existing) {
      console.log('Email not found in subscribers:', email);
      return new Response(
        JSON.stringify({ error: 'Cet email n\'est pas inscrit à notre newsletter' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!existing.subscribed) {
      console.log('Email already unsubscribed:', email);
      return new Response(
        JSON.stringify({ error: 'Cet email est déjà désinscrit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update subscriber to unsubscribe
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({ subscribed: false })
      .eq('email', email);

    if (updateError) {
      console.error('Error unsubscribing:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la désinscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully unsubscribed email:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Désinscription réussie' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in unsubscribe-newsletter:', error);
    return new Response(
      JSON.stringify({ error: 'Une erreur inattendue est survenue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
