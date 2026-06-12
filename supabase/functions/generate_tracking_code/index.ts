import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with Service Role Key to bypass RLS for checking uniqueness
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let trackingCode = ''
    let isUnique = false

    while (!isUnique) {
      trackingCode = ''
      for (let i = 0; i < 8; i++) {
        trackingCode += characters.charAt(Math.floor(Math.random() * characters.length))
      }

      const { data, error } = await supabaseClient
        .from('reports')
        .select('id')
        .eq('tracking_code', trackingCode)
        .maybeSingle()
      
      if (error && error.code !== 'PGRST116') throw error
      if (!data) isUnique = true
    }

    return new Response(JSON.stringify({ tracking_code: trackingCode }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
