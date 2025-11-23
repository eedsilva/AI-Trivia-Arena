import { NextResponse } from 'next/server';
import { getVoicePreview, saveVoicePreview } from '../../../lib/supabase/voicePreviews';
import { generateSpeech } from '../../../lib/integrations/deepgram/tts';
import { VOICE_PREVIEW_TEXT } from '../../../lib/integrations/deepgram/voices';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const voiceId = searchParams.get('voice_id');

    if (!voiceId) {
      return NextResponse.json({ error: 'Missing required parameter: voice_id' }, { status: 400 });
    }

    // Check if preview exists in cache (use server client in API route)
    const cachedUrl = await getVoicePreview(voiceId, true);
    if (cachedUrl) {
      return NextResponse.json({ url: cachedUrl, cached: true });
    }

    // Generate new preview from Deepgram
    try {
      const result = await generateSpeech({
        text: VOICE_PREVIEW_TEXT,
        voice: voiceId,
      });

      // Save to cache
      await saveVoicePreview(voiceId, result.url);

      return NextResponse.json({ url: result.url, cached: false });
    } catch (error) {
      console.error('Error generating voice preview:', error);
      return NextResponse.json({ error: 'Failed to generate voice preview' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in voice-preview API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
