import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  try {
    const { record, type } = await req.json();
    
    // Example logic based on webhook trigger (e.g., new row in satgas_case_updates)
    if (type === 'INSERT' && record.status) {
      const { data, error } = await resend.emails.send({
        from: 'SafePlace Notifikasi <no-reply@safeplace.app>',
        to: ['user@example.com'], // fetch user email logically
        subject: `Pembaruan Kasus: ${record.status}`,
        html: `
          <h2>Status laporan Anda telah diperbarui!</h2>
          <p>Status penanganan laporan saat ini menjadi: <strong>${record.status}</strong></p>
          <p>Catatan resmi: <em>${record.notes || '-'}</em></p>
          <br/>
          <p>Terima kasih,<br>Tim SafePlace</p>
        `,
      });

      if (error) {
        throw new Error(JSON.stringify(error));
      }

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Ignored" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
