import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { incidentType, daysSinceReport, lastMessage, 
            consultantName, timeOfDay } = await request.json()

    const prompt = `Kamu adalah AI Pendamping SafePlace yang 
berempati dan hangat. Buatkan pesan reminder harian yang 
personal dan menyentuh hati untuk seorang pelapor dengan 
kondisi berikut:

- Jenis kasus: ${incidentType}
- Sudah ${daysSinceReport} hari sejak laporan dibuat
- Konselor pendamping: ${consultantName || 'sedang dicari'}
- Waktu: ${timeOfDay}
- Pesan terakhir dari chat: ${lastMessage || 'belum ada chat'}

Buat pesan dalam Bahasa Indonesia yang:
1. Hangat dan personal, seolah dari teman yang peduli
2. Validasi perasaan mereka tanpa menghakimi
3. JANGAN suruh mereka melakukan sesuatu
4. JANGAN berikan saran atau instruksi
5. Gunakan gaya "I feel you", "kamu tidak sendiri", 
   "perasaanmu valid"
6. Maksimal 3 kalimat
7. Tidak perlu salam pembuka formal

Hanya tulis pesannya saja, tanpa label atau penjelasan.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const message = data.content?.[0]?.text || 
      'Hari ini, ingatlah bahwa kamu sudah sangat berani.'

    return NextResponse.json({ message })
  } catch {
    return NextResponse.json({ 
      message: 'Perasaanmu valid. Kamu tidak sendirian dalam ini.' 
    })
  }
}
