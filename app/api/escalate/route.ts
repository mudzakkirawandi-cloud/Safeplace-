import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const {
      reportId,
      escalateTo,
      selectedConsultantId,
      selectedSatgasId,
      escalateReason,
      fromPeerConsultantId
    } = await req.json()

    // Gunakan service role key untuk bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Update report
    const updateData: Record<string, unknown> = {
      escalation_reason: escalateReason,
      escalated_to: escalateTo,
      escalated_at: new Date().toISOString(),
      escalation_approved_by_reporter: false
    }

    if (escalateTo === 'consultant' || escalateTo === 'both') {
      updateData.assigned_consultant_id = selectedConsultantId
    }
    if (escalateTo === 'satgas' || escalateTo === 'both') {
      updateData.assigned_satgas_id = selectedSatgasId
    }

    const { error: updateError } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', reportId)

    if (updateError) {
      console.error('Update report error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // 2. Insert escalation notifications
    if (escalateTo === 'consultant' || escalateTo === 'both') {
      const { error: notifError } = await supabase
        .from('escalation_notifications')
        .insert({
          report_id: reportId,
          from_peer_consultant_id: fromPeerConsultantId,
          to_user_id: selectedConsultantId,
          to_role: 'consultant',
          status: 'waiting_reporter_approval',
          message: escalateReason
        })
      if (notifError) {
        console.error('Notif consultant error:', notifError)
      }
    }

    if (escalateTo === 'satgas' || escalateTo === 'both') {
      const { error: notifError } = await supabase
        .from('escalation_notifications')
        .insert({
          report_id: reportId,
          from_peer_consultant_id: fromPeerConsultantId,
          to_user_id: selectedSatgasId,
          to_role: 'satgas',
          status: 'waiting_reporter_approval',
          message: escalateReason
        })
      if (notifError) {
        console.error('Notif satgas error:', notifError)
      }
    }

    // 3. Insert pesan sistem ke chat
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        report_id: reportId,
        sender_id: null,
        content: `[ESKALASI]: Peer Consultant ingin meneruskan pendampinganmu ke ${
          escalateTo === 'consultant' ? 'Konselor Profesional' :
          escalateTo === 'satgas' ? 'Satgas Kampus' :
          'Konselor Profesional dan Satgas Kampus'
        }. Alasan: ${escalateReason}. Apakah kamu menyetujui?`,
        message_type: 'text',
        is_read: false
      })

    if (msgError) {
      console.error('Message error:', msgError)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Escalation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
