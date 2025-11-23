import { supabaseServer } from './server';
import { supabaseBrowser } from './browser';

/**
 * Get voice preview URL from Supabase cache
 * Uses server client for API routes, browser client for client-side calls
 */
export const getVoicePreview = async (
  voiceId: string,
  useServer = false
): Promise<string | null> => {
  try {
    const client = useServer ? supabaseServer() : supabaseBrowser();
    const { data, error } = await client
      .from('voice_previews')
      .select('audio_url')
      .eq('voice_id', voiceId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.audio_url;
  } catch (error) {
    console.error('Error fetching voice preview:', error);
    return null;
  }
};

/**
 * Save voice preview URL to Supabase cache
 */
export const saveVoicePreview = async (voiceId: string, audioUrl: string): Promise<void> => {
  try {
    const { error } = await supabaseServer().from('voice_previews').upsert(
      {
        voice_id: voiceId,
        audio_url: audioUrl,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'voice_id',
      }
    );

    if (error) {
      console.error('Error saving voice preview:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in saveVoicePreview:', error);
    throw error;
  }
};

/**
 * Check if voice preview exists in cache
 */
export const hasVoicePreview = async (voiceId: string, useServer = false): Promise<boolean> => {
  const preview = await getVoicePreview(voiceId, useServer);
  return preview !== null;
};
