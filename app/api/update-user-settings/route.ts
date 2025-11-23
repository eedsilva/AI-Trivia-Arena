import { NextResponse } from 'next/server';
import { updateUserSettings } from '../../../lib/supabase/helpers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, difficulty, tts_enabled, tts_voice } = body;

    console.log('💾 Updating user settings:', { user_id, difficulty, tts_enabled, tts_voice });

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const settings = await updateUserSettings({
      user_id,
      difficulty,
      tts_enabled,
      tts_voice,
    });

    console.log('✅ Settings updated successfully:', settings);

    return NextResponse.json(settings);
  } catch (error) {
    console.error('❌ Error updating user settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
