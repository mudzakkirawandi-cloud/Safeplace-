import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const groq = new Groq({ apiKey: GROQ_API_KEY });

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
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
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
      });

    } catch (geminiError) {
      console.error('Gemini API Error, falling back to Groq:', geminiError);

      // 2. Fallback to Groq
      const groqMessages = [
        { role: 'system', content: systemInstruction },
        ...messages.map((msg: { role: string; content: string }) => ({
          role: msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      ];

      const chatCompletion = await groq.chat.completions.create({
        messages: groqMessages as any,
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 1024,
      });

      const responseText = chatCompletion.choices[0]?.message?.content || '';

      return NextResponse.json({
        response: responseText,
        provider: 'groq'
      });
    }

  } catch (error) {
    console.error('AI Agent Error:', error);
    return NextResponse.json(
      { error: 'AI sedang tidak tersedia, coba beberapa saat lagi' },
      { status: 500 }
    );
  }
}
