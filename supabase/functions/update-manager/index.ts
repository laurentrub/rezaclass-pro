import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to check if user is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create a Supabase client with the auth token to check admin role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if the user is an admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error('User is not an admin');
    }

    // Parse the request body
    const { userId, email, password, fullName } = await req.json();

    if (!userId) {
      throw new Error('Missing required field: userId');
    }

    console.log('Updating manager user:', userId);

    // Create a Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Prepare update data for auth user
    const authUpdateData: any = {};
    
    if (email) {
      authUpdateData.email = email;
    }
    
    if (password) {
      authUpdateData.password = password;
    }

    if (fullName) {
      authUpdateData.user_metadata = { full_name: fullName };
    }

    // Update the user with admin privileges if there's auth data to update
    if (Object.keys(authUpdateData).length > 0) {
      const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        authUpdateData
      );

      if (updateUserError) {
        console.error('Error updating user:', updateUserError);
        if (updateUserError.message?.includes('already been registered')) {
          throw new Error('Un compte avec cette adresse email existe déjà. Veuillez utiliser une autre adresse email.');
        }
        throw updateUserError;
      }

      console.log('User updated successfully');
    }

    // Update the profile if fullName or email is provided
    if (fullName || email) {
      const profileUpdateData: any = {};
      if (fullName) profileUpdateData.full_name = fullName;
      if (email) profileUpdateData.email = email;

      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', userId);

      if (profileUpdateError) {
        console.error('Error updating profile:', profileUpdateError);
        throw profileUpdateError;
      }

      console.log('Profile updated successfully');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Gestionnaire mis à jour avec succès',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in update-manager function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
