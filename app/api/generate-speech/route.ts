import { NextResponse } from 'next/server';
import { generateSpeech } from '../../../lib/integrations/deepgram/tts';

export async function POST(req: Request) {
  try {
    const { text, voice } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const result = await generateSpeech({
      text,
      voice: voice ?? 'aura-asteria-en',
    });

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error('Error generating speech:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}
