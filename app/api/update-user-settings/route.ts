import { NextResponse } from 'next/server';
import { updateUserSettings } from '../../../lib/supabaseClient';

export async function POST(req: Request) {
  const body = await req.json();
  const { user_id, difficulty, tts_enabled, tts_voice } = body;

  const settings = await updateUserSettings({
    user_id,
    difficulty,
    tts_enabled,
    tts_voice
  });

  return NextResponse.json(settings);
}
