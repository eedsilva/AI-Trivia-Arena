import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseServer } from '../../../lib/supabaseClient';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { text, voice } = await req.json();
  const speech = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: voice ?? 'aura-asteria-en',
    input: text ?? ''
  });

  const audioBuffer = Buffer.from(await speech.arrayBuffer());
  const fileName = `speech-${Date.now()}.mp3`;

  await supabaseServer.storage.from('voice_samples').upload(fileName, audioBuffer, {
    contentType: 'audio/mpeg',
    upsert: true
  });

  const { data: publicUrl } = supabaseServer.storage.from('voice_samples').getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl.publicUrl });
}
