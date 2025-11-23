import { getOpenAIClient } from './client';
import { saveQuestion } from '../../supabase/helpers';

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation?: string;
}

export const generateTriviaQuestion = async (
  difficulty: string = 'easy'
): Promise<GeneratedQuestion> => {
  const difficultyLabel = difficulty.toLowerCase();
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Generate a multiple choice trivia question with 4-5 plausible options. Return JSON with question, options array (4-5 items), correct_answer_index (0-based), and explanation (2-3 sentence concise rationale for the correct answer). Make all options plausible to increase difficulty.',
      },
      {
        role: 'user',
        content: `Difficulty: ${difficultyLabel}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  const parsed = content ? JSON.parse(content) : null;

  // Normalize options to always be an array of strings
  let options = parsed?.options ?? ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Donatello'];
  if (Array.isArray(options)) {
    options = options.map((opt: any) =>
      typeof opt === 'string' ? opt : opt?.text || opt?.option || String(opt)
    );
  }

  return {
    question: parsed?.question ?? 'Who painted the Mona Lisa?',
    options,
    correct_answer_index: parsed?.correct_answer_index ?? 0,
    explanation:
      parsed?.explanation ??
      'Leonardo da Vinci painted the Mona Lisa, one of the most famous portraits in the world.',
  };
};

export const generateAndSaveQuestion = async (difficulty: string = 'easy') => {
  const generated = await generateTriviaQuestion(difficulty);

  const question = await saveQuestion({
    question_text: generated.question,
    options: generated.options,
    correct_answer_index: generated.correct_answer_index,
    explanation: generated.explanation,
  });

  return {
    id: question.id,
    question_text: question.question_text,
    options: question.options,
    correct_answer_index: question.correct_answer_index,
    explanation: question.explanation,
  };
};
