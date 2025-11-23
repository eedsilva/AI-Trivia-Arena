import { NextResponse } from 'next/server';
import { startGameSession } from '../../../lib/supabase/helpers';
import { supabaseServer } from '../../../lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'Missing required field: user_id' }, { status: 400 });
    }

    const supabase = supabaseServer();

    // Check if session already exists, if so return it, otherwise create new one
    const { data: existingSession, error: fetchError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching existing session:', fetchError);
      throw fetchError;
    }

    if (existingSession) {
      // Session exists, return it
      return NextResponse.json({ session: existingSession, isNew: false });
    }

    // No session exists, create new one
    const session = await startGameSession({
      user_id,
      score: 0,
      streak: 0,
    });

    return NextResponse.json({ session, isNew: true });
  } catch (error) {
    console.error('Error starting game session:', error);
    return NextResponse.json({ error: 'Failed to start game session' }, { status: 500 });
  }
}
