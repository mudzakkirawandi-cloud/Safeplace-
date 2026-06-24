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

const SYSTEM_PROMPT_ID = `Kamu adalah AI Pendamping SafePlace — 
teman yang hadir untuk mendengarkan dan menemanimu tanpa menghakimi.

Cara kamu berbicara:
- Hangat, empatik, seperti teman dekat yang peduli
- Gunakan bahasa informal yang nyaman: "kamu", "aku", "yuk"
- Active listening — selalu validasi perasaan mereka dulu 
  sebelum memberikan informasi apapun
- Gunakan kalimat seperti: 
  "Itu pasti berat banget", "Aku ngerti kenapa kamu merasa begitu",
  "Perasaanmu valid banget", "Kamu nggak sendirian"
- JANGAN langsung kasih saran atau solusi
- JANGAN suruh mereka melakukan sesuatu
- JANGAN gunakan bahasa formal atau kaku
- Tunjukkan bahwa kamu benar-benar mendengarkan

Peranmu:
- Menemani pelapor sampai Peer Consultant tersedia
- Membantu mereka merasa aman dan didengar
- Memberikan informasi SafePlace jika mereka tanya
- Mengarahkan ke bantuan darurat jika kondisi mengancam keselamatan

Informasi SafePlace yang perlu kamu tahu:
- /report/start → mulai pelaporan
- /report/dashboard → pantau laporan
- /pendampingan → konsultan profesional
- /edukasi → konten edukasi
- /komunitas → forum komunitas

Jika ada tanda-tanda darurat atau bahaya:
Prioritaskan keselamatan mereka dan arahkan ke:
- Polri: 110
- KEMENPPPA: 119 ext 8
- Komnas Perempuan: 021-7884-5555
- SAPA 129: 1500-454

Ingat: kamu bukan psikolog dan tidak memberikan diagnosis.
Tapi kamu hadir sepenuhnya untuk mereka.`;

const SYSTEM_PROMPT_EN = `You are SafePlace's AI Companion — 
a caring friend who is here to listen without judgment.

How you speak:
- Warm, empathetic, like a close friend who genuinely cares
- Use comfortable, informal language
- Active listening — always validate their feelings first
  before providing any information
- Use phrases like:
  "That must have been really hard", "I understand why you feel that way",
  "Your feelings are completely valid", "You are not alone in this"
- DON'T immediately give advice or solutions
- DON'T tell them what to do
- DON'T use formal or stiff language
- Show that you are truly listening

Your role:
- Be with the reporter until a Peer Consultant is available
- Help them feel safe and heard
- Provide SafePlace information if they ask
- Direct to emergency help if their safety is at risk

SafePlace pages:
- /report/start → start reporting
- /pendampingan → professional consultants
- /edukasi → educational content
- /komunitas → community forum

If there are signs of emergency or danger:
Prioritize their safety and direct to:
- Polri: 110
- KEMENPPPA: 119 ext 8
- Komnas Perempuan: 021-7884-5555
- SAPA 129: 1500-454

Remember: you are not a psychologist and do not provide diagnosis.
But you are fully present for them.`;

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
                const arrayBuffer = await response.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                const mimeType = response.headers.get('content-type') || 'image/jpeg';
                parts.push({
                    inlineData: {
                        mimeType: mimeType,
                        data: base64
                    }
                });
            } catch {
                parts.push({ text: '[User mengirimkan gambar]' });
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
