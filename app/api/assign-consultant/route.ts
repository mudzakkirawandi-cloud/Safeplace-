import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { report_id } = await req.json()
    if (!report_id) return NextResponse.json(
      { success: false, error: 'Missing report_id' }, { status: 400 }
    )

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Cari semua PC yang online
    const { data: onlinePCs } = await supabase
      .from('users')
      .select('id, full_name, last_assigned_at')
      .eq('role', 'peer_consultant')
      .eq('is_online', true)

    if (!onlinePCs || onlinePCs.length === 0) {
      await supabase.from('assignment_notifications').insert({
        report_id,
        peer_consultant_id: null,
        status: 'waiting'
      })
      await supabase.from('reports')
        .update({ assignment_status: 'waiting' })
        .eq('id', report_id)
      return NextResponse.json({ success: true, queued: true })
    }

    // Hitung kasus aktif per PC secara real-time
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

    // Sort: sedikit kasus dulu, lalu paling lama tidak dapat kasus
    pcWithLoad.sort((a, b) => {
      if (a.activeCount !== b.activeCount) 
        return a.activeCount - b.activeCount
      const aTime = a.last_assigned_at 
        ? new Date(a.last_assigned_at).getTime() : 0
      const bTime = b.last_assigned_at 
        ? new Date(b.last_assigned_at).getTime() : 0
      return aTime - bTime
    })

    const selected = pcWithLoad[0]
    const expiresAt = new Date(Date.now() + 60000).toISOString()

    // Assign ke laporan
    await supabase.from('reports')
      .update({ 
        assigned_consultant_id: selected.id,
        assignment_status: 'pending'
      })
      .eq('id', report_id)

    // Buat notification dengan expires_at
    await supabase.from('assignment_notifications').insert({
      report_id,
      peer_consultant_id: selected.id,
      status: 'pending',
      expires_at: expiresAt
    })

    // Update last_assigned_at PC yang dipilih
    await supabase.from('users')
      .update({ last_assigned_at: new Date().toISOString() })
      .eq('id', selected.id)

    return NextResponse.json({ 
      success: true, 
      assigned_to: selected.id,
      expires_at: expiresAt
    })

  } catch (error: unknown) {
    const err = error as Error
    return NextResponse.json(
      { success: false, error: err.message }, { status: 500 }
    )
  }
}
