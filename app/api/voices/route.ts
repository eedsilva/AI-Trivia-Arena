import { NextResponse } from 'next/server';
import { getDeepgramVoices } from '../../../lib/integrations/deepgram/voices';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const voices = getDeepgramVoices();
    return NextResponse.json({ voices });
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json({ error: 'Failed to fetch voices' }, { status: 500 });
  }
}
