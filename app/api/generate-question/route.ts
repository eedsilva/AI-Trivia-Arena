import { NextResponse } from 'next/server';
import { getAvailableProvider } from '../../../lib/game/questionProvider';
import {
  generateAndSaveQuestionOpenAI,
  generateAndSaveQuestionOpenRouter,
} from '../../../lib/integrations';

export async function POST(req: Request) {
  try {
    const { difficulty, excludeQuestionIds = [] } = await req.json();
    const difficultyLabel = (difficulty ?? 'easy').toLowerCase();

    console.log('🎲 Generating question with difficulty:', difficultyLabel);
    if (excludeQuestionIds.length > 0) {
      console.log('🚫 Excluding', excludeQuestionIds.length, 'previously asked questions');
    }

    // Get the configured provider (respects QUESTION_PROVIDER env)
    const provider = getAvailableProvider();

    // Generate question using the configured provider
    // Note: Currently we generate fresh questions each time, so duplicates are unlikely
    // The excludeQuestionIds tracking is primarily client-side to prevent showing the same question twice
    let question;
    if (provider === 'openrouter') {
      question = await generateAndSaveQuestionOpenRouter(difficultyLabel);
    } else {
      question = await generateAndSaveQuestionOpenAI(difficultyLabel);
    }

    return NextResponse.json({
      id: question.id,
      question_text: question.question_text,
      options: question.options,
      correct_answer_index: question.correct_answer_index,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error('Error generating question:', error);
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 });
  }
}
