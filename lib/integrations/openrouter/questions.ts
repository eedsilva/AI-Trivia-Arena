import { getOpenRouterClient, isOpenRouterAvailable } from './client';
import { saveQuestion } from '../../supabase/helpers';
import { envConfig } from '../../config';

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation?: string;
}

/**
 * Generate a trivia question using OpenRouter
 * Falls back to a default question if OpenRouter is not available
 */
export const generateTriviaQuestion = async (
  difficulty: string = 'easy'
): Promise<GeneratedQuestion> => {
  const difficultyLabel = difficulty.toLowerCase();

  // Check if OpenRouter is available
  if (!isOpenRouterAvailable()) {
    console.warn('OpenRouter is not available, using fallback question');
    return getFallbackQuestion();
  }

  try {
    const openrouter = getOpenRouterClient();
    const model = envConfig.openrouter.model || 'openai/gpt-4o-mini';

    const response = await openrouter.chat.send({
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
      model: model,
      responseFormat: { type: 'json_object' },
      stream: false,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in response');
    }

    // Handle both string and array content
    let contentStr: string;
    if (typeof content === 'string') {
      contentStr = content;
    } else if (Array.isArray(content)) {
      // Extract text from content items
      contentStr = content
        .filter((item: any) => item.type === 'text' && item.text)
        .map((item: any) => item.text)
        .join('');
    } else {
      contentStr = JSON.stringify(content);
    }

    if (!contentStr) {
      throw new Error('No text content in response');
    }

    const parsed = JSON.parse(contentStr);

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
  } catch (error) {
    console.error('Error generating question with OpenRouter:', error);
    return getFallbackQuestion();
  }
};

/**
 * Fallback question when OpenRouter fails or is unavailable
 */
const getFallbackQuestion = (): GeneratedQuestion => ({
  question: 'Who painted the Mona Lisa?',
  options: ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Donatello'],
  correct_answer_index: 0,
  explanation:
    'Leonardo da Vinci painted the Mona Lisa, one of the most famous portraits in the world.',
});

/**
 * Generate and save a trivia question to the database
 * Note: difficulty is not saved to questions table, it's only used for question generation
 */
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
