import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const { data, error } = await supabaseServer()
      .from('user_settings')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) {
      // If no settings found, return defaults
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          difficulty: 'easy',
          tts_enabled: false,
          tts_voice: 'aura-asteria-en',
        });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
