import { NextResponse } from 'next/server';
import { getUserSession, getUser } from '../../../lib/supabase/helpers';

// Mark as dynamic to avoid static generation issues
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'Missing required parameter: user_id' }, { status: 400 });
    }

    // Fetch both session and user data
    const [session, user] = await Promise.all([
      getUserSession(user_id).catch(() => null),
      getUser(user_id).catch(() => null),
    ]);

    return NextResponse.json({
      score: session?.score || 0,
      streak: session?.streak || 0,
      username: user?.username || '',
      avatar_url: user?.avatar_url || null,
    });
  } catch (error: any) {
    console.error('Error fetching game session:', error);
    return NextResponse.json({ error: 'Failed to fetch game session' }, { status: 500 });
  }
}
