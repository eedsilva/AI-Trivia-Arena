'use client';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import clsx from 'classnames';

interface QuestionExplanationModalProps {
  open: boolean;
  onClose: () => void;
  question: string;
  selectedOption?: string;
  selectedIndex?: number;
  correctOption: string;
  correctIndex: number;
  explanation?: string | null;
  wasCorrect: boolean;
  pointsGained: number;
  streak: number;
  isTimeout?: boolean;
}

export function QuestionExplanationModal({
  open,
  onClose,
  question,
  selectedOption,
  selectedIndex,
  correctOption,
  correctIndex,
  explanation,
  wasCorrect,
  pointsGained,
  streak,
  isTimeout = false,
}: QuestionExplanationModalProps) {
  const letters = ['A', 'B', 'C', 'D'];
  const selectedLetter = selectedIndex !== undefined ? letters[selectedIndex] : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isTimeout ? "Time's Up!" : wasCorrect ? 'Correct!' : 'Incorrect'}
      preventClose={false}
    >
      <div className="space-y-4">
        {/* Question */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-white/90 font-medium">{question}</p>
        </div>

        {/* Answer details */}
        <div className="space-y-3">
          {!isTimeout && selectedOption !== undefined && (
            <div
              className={clsx(
                'p-3 rounded-xl border-2',
                wasCorrect
                  ? 'bg-green-500/10 border-green-400/30'
                  : 'bg-red-500/10 border-red-400/30'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {wasCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                <span
                  className={clsx(
                    'font-semibold text-sm',
                    wasCorrect ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {wasCorrect ? 'Your Answer (Correct)' : 'Your Answer'}
                </span>
              </div>
              <p className="text-white/90 text-sm">
                {selectedLetter}: {selectedOption}
              </p>
            </div>
          )}

          {(!wasCorrect || isTimeout) && (
            <div className="bg-purple-500/10 border-2 border-purple-400/30 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-5 w-5 text-purple-400" />
                <span className="font-semibold text-sm text-purple-400">Correct Answer</span>
              </div>
              <p className="text-white/90 text-sm">
                {letters[correctIndex]}: {correctOption}
              </p>
            </div>
          )}
        </div>

        {/* Explanation Panel - appears after submission with LLM rationale as per spec */}
        {explanation && (
          <div className="bg-blue-500/10 border-2 border-blue-400/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-sm text-blue-400">Explanation</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">{explanation}</p>
          </div>
        )}

        {/* Points and streak info */}
        {!isTimeout && (
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
            <div>
              <p className="text-xs text-white/60">Points Gained</p>
              <p
                className={clsx(
                  'text-lg font-bold',
                  wasCorrect ? 'text-green-400' : 'text-white/40'
                )}
              >
                {wasCorrect ? `+${pointsGained}` : '+0'}
              </p>
            </div>
            {wasCorrect && streak > 1 && (
              <div>
                <p className="text-xs text-white/60">Current Streak</p>
                <p className="text-lg font-bold text-orange-400">x{streak}</p>
              </div>
            )}
          </div>
        )}

        {isTimeout && (
          <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-400/30">
            <p className="text-sm text-yellow-400 text-center">No points awarded for timeout</p>
          </div>
        )}

        <Button onClick={onClose} className="w-full" variant="primary">
          Continue
        </Button>
      </div>
    </Modal>
  );
}
