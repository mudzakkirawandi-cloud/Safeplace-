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
    const { record } = await req.json()
    if (!record || !record.id) {
       return new Response('Missing report record', { status: 400, headers: corsHeaders })
    }

    if (record.intent !== 'consultation') {
       return new Response('Not a consultation report', { status: 200, headers: corsHeaders })
    }

    // Initialize Supabase client with Service Role Key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find all online active consultants
    const { data: consultants, error: consultantsError } = await supabaseClient
      .from('users')
      .select('id, max_active_cases')
      .eq('role', 'consultant')
      .eq('status', 'active')
      .eq('availability_status', 'online')
      
    if (consultantsError) throw consultantsError

    if (!consultants || consultants.length === 0) {
      // No consultants online
      return new Response(JSON.stringify({ message: 'No online consultants available' }), { 
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    let selectedConsultant = null;
    let lowestCases = Infinity;

    for (const consultant of consultants) {
       const { count, error } = await supabaseClient
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_consultant_id', consultant.id)
          .neq('status', 'resolved')
          .neq('status', 'closed');
       
       if (error) continue;
       
       const activeCount = count || 0;
       if (activeCount < consultant.max_active_cases && activeCount < lowestCases) {
          lowestCases = activeCount;
          selectedConsultant = consultant;
       }
    }

    if (!selectedConsultant) {
       return new Response(JSON.stringify({ message: 'All consultants are at max capacity' }), { 
         status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
       })
    }

    // Assign the report to the selected consultant
    const { error: updateError } = await supabaseClient
       .from('reports')
       .update({ 
          assigned_consultant_id: selectedConsultant.id,
          status: 'in_consultation'
       })
       .eq('id', record.id);
       
    if (updateError) throw updateError;

    // Log the assignment action
    await supabaseClient.from('audit_logs').insert({
       action: 'auto_assign_consultant',
       target_type: 'report',
       target_id: record.id,
       metadata: { assigned_to: selectedConsultant.id, previous_status: record.status }
    });

    return new Response(JSON.stringify({ success: true, assigned_to: selectedConsultant.id }), {
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
