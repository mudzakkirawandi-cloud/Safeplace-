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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Cari notifikasi yang sudah expired
    const { data: expired } = await supabase
      .from('assignment_notifications')
      .select('id, report_id, peer_consultant_id')
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString())

    if (!expired || expired.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No expired assignments' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results = []

    for (const notif of expired) {
      // Mark current as timeout
      await supabase
        .from('assignment_notifications')
        .update({ status: 'timeout' })
        .eq('id', notif.id)

      // Cari PC lain yang online, kecuali yang sudah timeout
      const { data: timedOutPCs } = await supabase
        .from('assignment_notifications')
        .select('peer_consultant_id')
        .eq('report_id', notif.report_id)
        .in('status', ['timeout', 'skipped'])

      const excludeIds = [
        notif.peer_consultant_id,
        ...(timedOutPCs?.map(t => t.peer_consultant_id) || [])
      ].filter(Boolean)

      const { data: onlinePCs } = await supabase
        .from('users')
        .select('id, last_assigned_at')
        .eq('role', 'peer_consultant')
        .eq('is_online', true)
        .not('id', 'in', `(${excludeIds.join(',')})`)

      if (!onlinePCs || onlinePCs.length === 0) {
        // Tidak ada PC lain — masuk waiting
        await supabase
          .from('assignment_notifications')
          .insert({
            report_id: notif.report_id,
            peer_consultant_id: null,
            status: 'waiting'
          })
        await supabase
          .from('reports')
          .update({ assignment_status: 'waiting' })
          .eq('id', notif.report_id)
        results.push({ report_id: notif.report_id, result: 'queued' })
        continue
      }

      // Load balancing: hitung kasus aktif per PC
      const pcWithLoad = await Promise.all(
        onlinePCs.map(async (pc) => {
          const { count } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_consultant_id', pc.id)
            .neq('status', 'closed')
          return { ...pc, activeCount: count || 0 }
        })
      )

      pcWithLoad.sort((a, b) => {
        if (a.activeCount !== b.activeCount)
          return a.activeCount - b.activeCount
        const aTime = a.last_assigned_at
          ? new Date(a.last_assigned_at).getTime() : 0
        const bTime = b.last_assigned_at
          ? new Date(b.last_assigned_at).getTime() : 0
        return aTime - bTime
      })

      const next = pcWithLoad[0]
      const expiresAt = new Date(Date.now() + 60000).toISOString()

      // Assign ke PC berikutnya
      await supabase
        .from('reports')
        .update({ assigned_consultant_id: next.id })
        .eq('id', notif.report_id)

      await supabase
        .from('assignment_notifications')
        .insert({
          report_id: notif.report_id,
          peer_consultant_id: next.id,
          status: 'pending',
          expires_at: expiresAt
        })

      await supabase
        .from('users')
        .update({ last_assigned_at: new Date().toISOString() })
        .eq('id', next.id)

      results.push({ 
        report_id: notif.report_id, 
        result: 'reassigned',
        assigned_to: next.id 
      })
    }

    return new Response(
      JSON.stringify({ success: true, processed: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
