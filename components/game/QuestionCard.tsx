import { OptionButton, OptionState } from './OptionButton';
import { Card } from '../global/Card';

export interface QuestionData {
  id: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
}

interface QuestionCardProps {
  question: QuestionData;
  selectedIndex?: number;
  revealed?: boolean;
  onSelect?: (index: number) => void;
}

export function QuestionCard({ question, selectedIndex, revealed, onSelect }: QuestionCardProps) {
  return (
    <Card className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm uppercase tracking-wide text-white/50">Current Question</div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">AI Generated</div>
      </div>
      <h2 className="text-2xl font-bold text-white">{question.question_text}</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {question.options.map((option, idx) => {
          let state: OptionState = 'default';
          if (revealed) {
            if (idx === question.correct_answer_index) state = 'correct';
            else if (selectedIndex === idx) state = 'wrong';
          }
          return (
            <OptionButton
              key={idx}
              label={option}
              state={state}
              onClick={() => onSelect?.(idx)}
              disabled={revealed}
            />
          );
        })}
      </div>
    </Card>
  );
}
