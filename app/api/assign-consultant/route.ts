import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { report_id } = await req.json();

    if (!report_id) {
      return NextResponse.json({ success: false, error: 'Missing report_id' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Cari peer consultant yang eligible
    const { data: eligibleConsultants, error: fetchError } = await supabase
      .from('users')
      .select('id, full_name, active_cases_count, max_cases')
      .eq('role', 'peer_consultant')
      .eq('is_online', true)
      .lt('active_cases_count', 4)
      .order('active_cases_count', { ascending: true });

    if (fetchError) {
      console.error('Error fetching eligible consultants:', fetchError);
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    if (eligibleConsultants && eligibleConsultants.length > 0) {
      // Masukkan ke assignment_notifications untuk semua yang eligible
      const notifications = eligibleConsultants.map(c => ({
        report_id,
        peer_consultant_id: c.id,
        status: 'pending'
      }));

      const { error: insertError } = await supabase
        .from('assignment_notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error inserting notifications:', insertError);
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }

      // Update status laporan menjadi pending assignment
      await supabase
        .from('reports')
        .update({ assignment_status: 'pending' })
        .eq('id', report_id);

      return NextResponse.json({ success: true, notified: eligibleConsultants.length });
    } else {
      // Tidak ada peer consultant yang eligible
      await supabase
        .from('reports')
        .update({ assignment_status: 'unassigned' })
        .eq('id', report_id);

      return NextResponse.json({ success: true, queued: true });
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in assign-consultant:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
