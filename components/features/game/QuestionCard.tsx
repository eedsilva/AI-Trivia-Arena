import clsx from 'classnames';
import { OptionButton, OptionState } from './OptionButton';
import { Card } from '../../ui/Card';
import type { QuestionData } from '../../../lib/types';

interface QuestionCardProps {
  question: QuestionData;
  selectedIndex?: number;
  revealed?: boolean;
  onSelect?: (index: number) => void;
  explanation?: string | null;
  wasCorrect?: boolean | null;
  disabled?: boolean;
  isLoading?: boolean;
}

export function QuestionCard({
  question,
  selectedIndex,
  revealed,
  onSelect,
  explanation,
  wasCorrect,
  disabled = false,
  isLoading = false,
}: QuestionCardProps) {
  // Support 4-5 options as per spec
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const optionCount = Math.min(question.options.length, 5);

  return (
    <Card className="space-y-6 bg-white/5 border-white/10 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm uppercase tracking-wide text-white/60 font-semibold">
          Current Question
        </div>
        <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-accent/20 border border-purple-400/30 px-3 py-1 text-xs text-white/80 font-medium">
          AI Generated
        </div>
      </div>
      {/* Centered Question Card as per spec */}
      <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight text-center">
        {question.question_text}
      </h2>
      {/* 4-5 multiple-choice answer buttons as per spec */}
      {!isLoading && (
        <div
          className={`grid gap-3 pt-2 ${
            optionCount === 5 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {question.options.map((option, idx) => {
            let state: OptionState = 'default';
            if (revealed) {
              if (idx === question.correct_answer_index) state = 'correct';
              else if (selectedIndex === idx) state = 'wrong';
            }

            // Handle both string and object formats
            const optionText =
              typeof option === 'string'
                ? option
                : (option as any)?.text || (option as any)?.option || String(option);

            return (
              <OptionButton
                key={idx}
                label={optionText}
                letter={letters[idx]}
                state={state}
                onClick={() => onSelect?.(idx)}
                disabled={disabled || revealed}
                aria-selected={selectedIndex === idx}
              />
            );
          })}
        </div>
      )}
    </Card>
  );
}
