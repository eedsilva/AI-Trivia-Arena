import { NextResponse } from 'next/server';
import { getAvailableProvider } from '../../../lib/game/questionProvider';
import {
  generateAndSaveQuestionOpenAI,
  generateAndSaveQuestionOpenRouter,
} from '../../../lib/integrations';
import { supabaseServer } from '../../../lib/supabase/server';

const MAX_GENERATION_RETRIES = 5;

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

    // Generate a unique question that's not in the exclusion list
    let question: Awaited<ReturnType<typeof generateAndSaveQuestionOpenAI>> | null = null;
    let attempts = 0;
    let isDuplicate = true;

    while (isDuplicate && attempts < MAX_GENERATION_RETRIES) {
      attempts++;
      
      // Generate question using the configured provider
      if (provider === 'openrouter') {
        question = await generateAndSaveQuestionOpenRouter(difficultyLabel);
      } else {
        question = await generateAndSaveQuestionOpenAI(difficultyLabel);
      }

      if (!question) {
        console.error(`❌ Failed to generate question on attempt ${attempts}`);
        isDuplicate = true;
        continue;
      }

      // Check if this question ID is in the exclusion list
      if (excludeQuestionIds.length > 0 && excludeQuestionIds.includes(question.id)) {
        console.log(`⚠️ Generated question ${question.id} is in exclusion list, retrying... (attempt ${attempts}/${MAX_GENERATION_RETRIES})`);
        isDuplicate = true;
        // Small delay before retry to allow for more variation
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      // Check if question text already exists in database (deduplication)
      // This checks for other questions with the same text (excluding the one we just created)
      const { data: existingQuestions, error: queryError } = await supabaseServer()
        .from('questions')
        .select('id')
        .eq('question_text', question.question_text)
        .neq('id', question.id);

      // If query failed, treat as potential duplicate and retry to be safe
      if (queryError) {
        console.error(`⚠️ Error checking for duplicate questions:`, queryError);
        console.log(`⚠️ Treating as potential duplicate and retrying... (attempt ${attempts}/${MAX_GENERATION_RETRIES})`);
        isDuplicate = true;
        // Small delay before retry to allow for more variation
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      if (existingQuestions && existingQuestions.length > 0) {
        console.log(`⚠️ Question text already exists in database (${existingQuestions.length} duplicates), retrying... (attempt ${attempts}/${MAX_GENERATION_RETRIES})`);
        isDuplicate = true;
        // Small delay before retry to allow for more variation
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      // Question is unique!
      isDuplicate = false;
    }

    if (isDuplicate || !question) {
      console.error('❌ Failed to generate unique question after', MAX_GENERATION_RETRIES, 'attempts');
      return NextResponse.json(
        { error: 'Failed to generate unique question after multiple attempts' },
        { status: 500 }
      );
    }

    console.log('✅ Generated unique question:', question.id);

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
