import { NextResponse } from 'next/server';
import { incrementScore, supabaseServer } from '../../../lib/supabaseClient';

export async function POST(req: Request) {
  const { user_id, question_id, selected_index } = await req.json();

  const { data: question, error } = await supabaseServer
    .from('questions')
    .select('correct_answer_index, explanation')
    .eq('id', question_id)
    .single();

  if (error || !question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  const correct = selected_index === question.correct_answer_index;

  let newScore = 0;
  let newStreak = 0;

  const { data: existingSession } = await supabaseServer
    .from('game_sessions')
    .select('score, streak')
    .eq('user_id', user_id)
    .single();

  if (correct) {
    await incrementScore(user_id, 100);
    newStreak = (existingSession?.streak ?? 0) + 1;
  } else {
    newStreak = 0;
  }

  await supabaseServer
    .from('game_sessions')
    .upsert({ user_id, streak: newStreak })
    .eq('user_id', user_id);

  const { data: session } = await supabaseServer
    .from('game_sessions')
    .select('score, streak')
    .eq('user_id', user_id)
    .single();

  newScore = session?.score ?? 0;
  newStreak = session?.streak ?? newStreak;

  return NextResponse.json({
    correct,
    correct_answer_index: question.correct_answer_index,
    explanation: question.explanation ?? 'Great work!',
    new_score: newScore,
    streak: newStreak
  });
}
