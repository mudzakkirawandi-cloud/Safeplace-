import { NextRequest, NextResponse } from 'next/server';


const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

if (process.env.NODE_ENV !== 'production') {
  console.log('[AI Agent] GEMINI_API_KEY exists:', !!GEMINI_API_KEY);
  console.log('[AI Agent] GROQ_API_KEY exists:', !!GROQ_API_KEY);
}



const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const SYSTEM_PROMPT_ID = `Kamu adalah AI Pendamping SafePlace yang berempati dan profesional.
Sebelum menjawab, selalu:
1. Analisa konteks pesan dan attachment yang dikirim user
2. Jika ada gambar, deskripsikan apa yang kamu lihat
3. Jawab sesuai konteks — jangan jawaban generik
4. Gunakan bahasa Indonesia yang hangat dan supportif

Jika user kirim gambar → analisa gambar tersebut dulu baru jawab.
Jika user kirim audio → acknowledge bahwa ada voice note.
Jika user kirim file → acknowledge nama file dan tipenya.

Peranmu:
- Membantu pengguna memahami cara menggunakan SafePlace
- Memberikan panduan alur pelaporan yang tepat
- Memberikan informasi dasar hukum perlindungan korban kekerasan seksual di Indonesia (UU TPKS No. 12 Tahun 2022)
- Memberikan dukungan emosional awal yang empatik dan tidak menghakimi
- Mengarahkan ke konsultan profesional jika diperlukan

Yang TIDAK boleh kamu lakukan:
- Memberikan diagnosis psikologis
- Menjanjikan hasil hukum tertentu
- Meminta detail kejadian yang tidak perlu
- Mengungkap identitas pelapor

Selalu akhiri respons dengan reminder: "Jika kamu membutuhkan pendampingan langsung, konsultan kami siap membantu."

Halaman-halaman di SafePlace yang perlu kamu ketahui:
- /report/start → mulai pelaporan
- /report/track → lacak laporan anonim
- /pendampingan → daftar konsultan
- /edukasi → konten edukasi
- /komunitas → forum komunitas (segera hadir)
- /login → masuk akun`;

const SYSTEM_PROMPT_EN = `You are the empathetic and professional SafePlace AI Companion.
Before answering, always:
1. Analyze the context of the user's message and any attachments sent
2. If there is an image, describe what you see
3. Answer according to the context — no generic answers
4. Use warm and supportive language

If the user sends an image → analyze the image first before answering.
If the user sends audio → acknowledge that there is a voice note.
If the user sends a file → acknowledge the file name and its type.

Your role:
- Help users understand how to use SafePlace
- Provide guidance on the correct reporting workflow
- Provide basic information on the legal protection for victims of sexual violence in Indonesia (TPKS Law No. 12 of 2022)
- Provide initial emotional support that is empathetic and non-judgmental
- Direct users to professional consultants if needed

What you MUST NOT do:
- Provide psychological diagnosis
- Promise specific legal outcomes
- Ask for unnecessary details of incidents
- Reveal the reporter's identity

Always end your response with the reminder: "If you need direct support, our consultants are ready to help."

SafePlace pages you need to know:
- /report/start → start reporting
- /report/track → track anonymous report
- /pendampingan → list of consultants
- /edukasi → educational content
- /komunitas → community forum (coming soon)
- /login → log in`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, locale } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400, headers: corsHeaders });
    }

    const isEnglish = locale === 'en';
    const systemInstruction = isEnglish ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ID;

    try {
      // 1. Try Gemini REST API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const geminiContents = await Promise.all(messages.map(async (msg: { role: string; content: string; attachment_url?: string; message_type?: string; attachment_name?: string }) => {
        const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [];
        
        if (msg.message_type === 'image' && msg.attachment_url) {
            try {
                const response = await fetch(msg.attachment_url);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    const base64 = Buffer.from(arrayBuffer).toString('base64');
                    const mimeType = response.headers.get('content-type') || 'image/jpeg';
                    parts.push({
                        inlineData: {
                            mimeType,
                            data: base64
                        }
                    });
                }
            } catch (e) {
                console.error("Failed to fetch image", e);
            }
        } else if (msg.attachment_url && (msg.message_type === 'file' || msg.message_type === 'audio' || msg.message_type === 'video')) {
            parts.push({ text: `[Sistem: User mengirimkan sebuah attachment berjenis ${msg.message_type} bernama "${msg.attachment_name || 'file'}" dengan URL: ${msg.attachment_url}. Analisa konteks berdasarkan teks pesan jika ada.]` });
        }
        
        if (msg.content) {
            parts.push({ text: msg.content });
        }

        return {
          role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
          parts
        };
      }));

      const geminiBody = {
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: geminiContents
      };

      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody)
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        throw new Error(`Gemini status ${geminiResponse.status}: ${errorText}`);
      }

      const geminiData = await geminiResponse.json();
      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error('No response text from Gemini');
      }

      return NextResponse.json({
        response: responseText,
        provider: 'gemini'
      }, { headers: corsHeaders });

    } catch (geminiError: unknown) {
      const errorMessage = geminiError instanceof Error ? geminiError.message : String(geminiError);
      console.error('[AI Agent] Gemini REST API Error Details:', errorMessage);

      // 2. Fallback to Groq REST API
      const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
      
      const groqMessages = [
        { role: 'system', content: systemInstruction },
        ...messages.map((msg: { role: string; content: string; attachment_url?: string; message_type?: string; attachment_name?: string }) => {
          let contentStr = msg.content || '';
          if (msg.attachment_url) {
             contentStr += `\n[Sistem: User mengirimkan attachment berjenis ${msg.message_type} bernama "${msg.attachment_name || 'file'}".]`;
          }
          return {
            role: msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user',
            content: contentStr
          };
        })
      ];

      const groqResponse = await fetch(groqUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: groqMessages,
          temperature: 0.7,
          max_tokens: 1024,
        })
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        throw new Error(`Groq status ${groqResponse.status}: ${errorText}`);
      }

      const groqData = await groqResponse.json();
      const fallbackResponseText = groqData.choices?.[0]?.message?.content || '';

      if (!fallbackResponseText) {
        throw new Error('No response text from Groq');
      }

      return NextResponse.json({
        response: fallbackResponseText,
        provider: 'groq'
      }, { headers: corsHeaders });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[AI Agent] Fatal Error Details:', errorMessage, errorStack);
    return NextResponse.json(
      { 
        error: 'AI sedang tidak tersedia, coba beberapa saat lagi',
        details: process.env.NODE_ENV !== 'production' ? errorMessage : undefined
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
