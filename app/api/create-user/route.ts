import { NextResponse } from 'next/server';
import { createUser } from '../../../lib/supabase/helpers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, username, avatar_url } = body;

    if (!id || !username) {
      return NextResponse.json(
        { error: 'Missing required fields: id and username' },
        { status: 400 }
      );
    }

    const user = await createUser({
      id,
      username,
      avatar_url,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
