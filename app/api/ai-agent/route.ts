import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

if (process.env.NODE_ENV !== 'production') {
  console.log('[AI Agent] GEMINI_API_KEY exists:', !!GEMINI_API_KEY);
  console.log('[AI Agent] GROQ_API_KEY exists:', !!GROQ_API_KEY);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const groq = new Groq({ apiKey: GROQ_API_KEY });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const SYSTEM_PROMPT_ID = `Kamu adalah AI Assistant SafePlace — platform pelaporan dan pendampingan kekerasan seksual di Indonesia.

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

const SYSTEM_PROMPT_EN = `You are the SafePlace AI Assistant — a sexual violence reporting and support platform in Indonesia.

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
      // 1. Try Gemini first
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction,
      });

      // Format messages for Gemini (last message is the prompt, previous are history)
      const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));
      const currentMessage = messages[messages.length - 1].content;

      const chatSession = model.startChat({ history });
      const result = await chatSession.sendMessage(currentMessage);
      const responseText = result.response.text();

      return NextResponse.json({
        response: responseText,
        provider: 'gemini'
      }, { headers: corsHeaders });

    } catch (geminiError: unknown) {
      const errorMessage = geminiError instanceof Error ? geminiError.message : String(geminiError);
      console.error('[AI Agent] Gemini API Error Details:', errorMessage);

      // 2. Fallback to Groq
      const groqMessages = [
        { role: 'system' as const, content: systemInstruction },
        ...messages.map((msg: { role: string; content: string }) => ({
          role: (msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
          content: msg.content
        }))
      ];

      const chatCompletion = await groq.chat.completions.create({
        messages: groqMessages,
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 1024,
      });

      const responseText = chatCompletion.choices[0]?.message?.content || '';

      return NextResponse.json({
        response: responseText,
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
