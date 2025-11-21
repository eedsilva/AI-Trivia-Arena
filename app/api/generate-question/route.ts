import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { saveQuestion } from '../../../lib/supabaseClient';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { difficulty } = await req.json();
  const difficultyLabel = (difficulty ?? 'easy').toLowerCase();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Generate a multiple choice trivia question with four options. Return JSON with question, options array, correct index.'
      },
      {
        role: 'user',
        content: `Difficulty: ${difficultyLabel}`
      }
    ],
    response_format: { type: 'json_object' }
  });

  const content = completion.choices[0]?.message?.content;
  const parsed = content ? JSON.parse(content) : null;

  const question = await saveQuestion({
    question_text: parsed?.question ?? 'Who painted the Mona Lisa?',
    options: parsed?.options ?? ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Donatello'],
    correct_answer_index: parsed?.correct_answer_index ?? 0,
    difficulty: difficultyLabel
  });

  return NextResponse.json({
    id: question.id,
    question_text: question.question_text,
    options: question.options,
    correct_answer_index: question.correct_answer_index
  });
}
