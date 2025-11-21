'use client';
import { useEffect, useState } from 'react';
import { GameHUD } from '../../components/game/GameHUD';
import { QuestionCard, QuestionData } from '../../components/game/QuestionCard';
import { TimerBar } from '../../components/game/TimerBar';
import { Button } from '../../components/global/Button';
import { TopPlayersSidebar } from '../../components/game/TopPlayersSidebar';
import { useGameStore } from '../../lib/store/gameStore';

const sampleQuestion: QuestionData = {
  id: '1',
  question_text: 'Which artist is known for painting the ceiling of the Sistine Chapel?',
  options: ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Donatello'],
  correct_answer_index: 1
};

export default function GamePage() {
  const [question, setQuestion] = useState<QuestionData>(sampleQuestion);
  const [selected, setSelected] = useState<number | undefined>();
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(1);
  const { username, score, streak, correctCount, applyResult } = useGameStore();

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 15000;
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.max(0, 1 - elapsed / duration);
      setProgress(p);
      if (p > 0 && !revealed) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [question, revealed]);

  const handleSelect = (idx: number) => {
    setSelected(idx);
  };

  const handleReveal = () => {
    if (selected === undefined) return;
    const isCorrect = selected === question.correct_answer_index;
    setRevealed(true);
    applyResult(isCorrect);
  };

  const handleNext = () => {
    setRevealed(false);
    setSelected(undefined);
    setProgress(1);
    setQuestion({ ...sampleQuestion, id: crypto.randomUUID() });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex-1 space-y-6">
          <GameHUD username={username} score={score} streak={streak} correctCount={correctCount} />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Time Remaining</span>
              <span className="text-sm font-semibold text-accent2">{Math.round(progress * 15)}s</span>
            </div>
            <TimerBar progress={progress} />
          </div>
          <QuestionCard
            question={question}
            selectedIndex={selected}
            revealed={revealed}
            onSelect={handleSelect}
          />
          <div className="flex justify-center">
            <Button
              className="px-8"
              onClick={revealed ? handleNext : handleReveal}
              disabled={selected === undefined}
            >
              {revealed ? 'Next Question' : 'Submit Answer'}
            </Button>
          </div>
        </div>
        <TopPlayersSidebar />
      </div>
    </main>
  );
}
