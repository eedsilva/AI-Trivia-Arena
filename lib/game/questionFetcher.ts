import type { QuestionData } from '../types';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export interface FetchQuestionOptions {
  difficulty?: string;
  retries?: number;
  excludeQuestionIds?: string[];
}

/**
 * Fetch a new question from the API with retry logic and error handling
 *
 * @param options - Fetch options including difficulty and retry count
 * @param options.difficulty - Difficulty level (easy, medium, hard)
 * @param options.retries - Number of retry attempts (default: 3)
 * @param options.excludeQuestionIds - Array of question IDs to exclude from results
 * @returns Promise resolving to QuestionData
 *
 * @example
 * const question = await fetchQuestion({ difficulty: 'medium', excludeQuestionIds: ['id1', 'id2'] });
 */
export async function fetchQuestion(options: FetchQuestionOptions = {}): Promise<QuestionData> {
  const { difficulty = 'easy', retries = MAX_RETRIES, excludeQuestionIds = [] } = options;

  const attemptFetch = async (attempt: number): Promise<QuestionData> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ difficulty, excludeQuestionIds }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate question data - support 4-5 options as per spec
      if (
        !data.question_text ||
        !Array.isArray(data.options) ||
        data.options.length < 4 ||
        data.options.length > 5
      ) {
        throw new Error('Invalid question data received');
      }

      return {
        id: data.id || crypto.randomUUID(),
        question_text: data.question_text,
        options: data.options,
        correct_answer_index: data.correct_answer_index,
        explanation: data.explanation || null,
      };
    } catch (error: any) {
      console.error(`Question fetch attempt ${attempt} failed:`, error);

      if (attempt < retries && error.name !== 'AbortError') {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * attempt));
        return attemptFetch(attempt + 1);
      }

      // Return fallback question after all retries
      return getFallbackQuestion();
    }
  };

  return attemptFetch(1);
}

/**
 * Get a fallback question when API fails
 * Returns a random question from a predefined set
 *
 * @returns Fallback QuestionData
 * @internal
 */
function getFallbackQuestion(): QuestionData {
  const fallbackQuestions = [
    {
      id: crypto.randomUUID(),
      question_text: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correct_answer_index: 2,
      explanation:
        'Paris is the capital and largest city of France, located in the north-central part of the country.',
    },
    {
      id: crypto.randomUUID(),
      question_text: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correct_answer_index: 1,
      explanation:
        'Mars is called the Red Planet because of the iron oxide (rust) on its surface, which gives it a reddish appearance.',
    },
    {
      id: crypto.randomUUID(),
      question_text: 'What is the largest ocean on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correct_answer_index: 3,
      explanation:
        "The Pacific Ocean is the largest and deepest ocean, covering approximately one-third of the Earth's surface.",
    },
  ];

  return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
}
