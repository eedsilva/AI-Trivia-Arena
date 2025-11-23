'use client';
import { useEffect, useState, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Settings, Sparkles, Loader2 } from 'lucide-react';
import clsx from 'classnames';
import { GameHUD } from '../../components/features/game/GameHUD';
import { QuestionCard } from '../../components/features/game/QuestionCard';
import type { QuestionData } from '../../lib/types';
import { TimerBar } from '../../components/features/game/TimerBar';
import { Button } from '../../components/ui/Button';
import { TopPlayersSidebar } from '../../components/features/leaderboard/TopPlayersSidebar';
import { QuestionExplanationModal } from '../../components/features/game/QuestionExplanationModal';
import { SettingsModal } from '../../components/features/game/SettingsModal';
import { useGameStore } from '../../lib/store/gameStore';
import { useUserStore } from '../../lib/store/userStore';
import { useUserSettingsStore } from '../../lib/store/userSettingsStore';
import { hasUserCache, getUserFromCache } from '../../lib/storage/userCache';
import { useGameSession } from '../../lib/hooks/useGameSession';
import { useQuestion } from '../../lib/hooks/useQuestion';
import { useGameSessionSync } from '../../lib/hooks/useGameSessionSync';
import { useUserSettings } from '../../lib/hooks/useUserSettings';
import { getPointsForDifficulty } from '../../lib/game/difficulty';

const TIMER_DURATION = 30000; // 30 seconds

// Fallback question for initial render
const FALLBACK_QUESTION: QuestionData = {
  id: 'fallback',
  question_text: 'Loading question...',
  options: ['Loading...', 'Loading...', 'Loading...', 'Loading...'],
  correct_answer_index: 0,
  explanation: null,
};

/**
 * Game page component
 * Main trivia game interface with real-time updates and AI-generated questions
 */
export default function GamePage() {
  const router = useRouter();

  // Local UI state
  const [selected, setSelected] = useState<number | undefined>();
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(1);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const initRef = useRef(false);

  // Refs for timer management
  const timerRef = useRef<number | undefined>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice loading state
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);

  // Store hooks
  const {
    username,
    score,
    streak,
    correctCount,
    maxStreak,
    applyResult,
    setUsername,
    initializeFromDB,
    resetCorrectCount,
    setQuestion: setQuestionInStore,
    currentQuestion,
    askedQuestionIds,
    addAskedQuestion,
    resetAskedQuestions,
  } = useGameStore();

  const { user_id, setUser } = useUserStore();
  const { difficulty, tts_enabled, tts_voice, updateSettings } = useUserSettingsStore();

  // Fetch settings from database and sync to store
  const { settings: fetchedSettings, isLoading: isLoadingSettings } = useUserSettings(user_id, {
    enabled: !!user_id && isInitialized,
  });

  // Custom hooks for data fetching
  const { sessionData, isLoading: isLoadingSession } = useGameSession(user_id, {
    enabled: !!user_id && isInitialized,
  });

  const {
    question: fetchedQuestion,
    isLoading: isLoadingQuestion,
    isError: isQuestionError,
    fetchNewQuestion,
    isFetchingNew,
  } = useQuestion(difficulty, {
    enabled: isInitialized && !!user_id,
    excludeQuestionIds: askedQuestionIds,
  });

  // Sync score to server
  useGameSessionSync(user_id);

  // Get current question from store or fallback
  const question = useMemo(() => {
    return currentQuestion || fetchedQuestion || FALLBACK_QUESTION;
  }, [currentQuestion, fetchedQuestion]);

  // Check if question is loading (including voice generation)
  const isQuestionLoading = isLoadingQuestion || isFetchingNew || (tts_enabled && isVoiceLoading);

  // Play question with AI voice if enabled
  const playQuestionWithVoice = useCallback(
    async (questionText: string, voice: string) => {
      if (!tts_enabled || !voice) {
        setIsVoiceLoading(false);
        return;
      }

      setIsVoiceLoading(true);
      console.log('🎤 Generating AI voice...');

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      try {
        const response = await fetch('/api/generate-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: questionText, voice }),
        });

        if (response.ok) {
          const data = await response.json();
          const audio = new Audio(data.url);
          audioRef.current = audio;

          console.log('🔊 Voice ready, playing now...');
          setIsVoiceLoading(false);
          await audio.play();
        } else {
          console.error('Failed to generate voice');
          setIsVoiceLoading(false);
        }
      } catch (error) {
        console.error('Error playing question with AI voice:', error);
        setIsVoiceLoading(false);
        // Graceful degradation - continue without voice
      }
    },
    [tts_enabled]
  );

  // Wait for hydration before checking localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize game-specific state on mount - use useLayoutEffect to run before paint
  useLayoutEffect(() => {
    if (!isHydrated || initRef.current || typeof window === 'undefined') return;
    initRef.current = true;

    const initializeGame = () => {
      console.log('🎮 GamePageContent initializing');
      // Check if user exists in localStorage
      if (!hasUserCache()) {
        router.push('/');
        return;
      }

      const cachedUser = getUserFromCache();
      if (!cachedUser || !cachedUser.user_id) {
        router.push('/');
        return;
      }

      // Set user in store (stores are already initialized by StoreProvider)
      setUser({
        username: cachedUser.username,
        user_id: cachedUser.user_id,
      });
      setUsername(cachedUser.username);

      setIsInitialized(true);
    };

    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  // Sync fetched settings from database to Zustand store
  const hasInitializedSettings = useRef(false);
  useEffect(() => {
    if (fetchedSettings && isInitialized && !hasInitializedSettings.current) {
      console.log('⚙️ Syncing settings from database to store:', fetchedSettings);
      updateSettings(fetchedSettings);
      hasInitializedSettings.current = true;
    }
  }, [fetchedSettings, isInitialized, updateSettings]);

  // Track score/streak changes for debugging
  useEffect(() => {
    console.log('💰 Store values:', { score, streak, correctCount, maxStreak });
  }, [score, streak, correctCount, maxStreak]);

  // Initialize game session data when available (only once on mount)
  const hasInitializedFromDB = useRef(false);
  useEffect(() => {
    console.log('📊 sessionData changed:', {
      sessionData,
      isInitialized,
      hasInitialized: hasInitializedFromDB.current,
    });

    if (sessionData && isInitialized && !hasInitializedFromDB.current) {
      console.log('🔵 Initializing from DB:', sessionData);
      // Sync username from database if available and different
      if (sessionData.username && sessionData.username !== username) {
        setUsername(sessionData.username);
        // Also update userStore to keep it in sync
        if (user_id) {
          setUser({
            username: sessionData.username,
            user_id: user_id,
          });
        }
      }

      // Start each session fresh with score/streak at 0
      // The database stores the high score, which will be preserved
      // As the user plays, their score will be synced and only updated if it's higher
      initializeFromDB(0, 0); // Start fresh each session
      resetCorrectCount();
      resetAskedQuestions(); // Reset asked questions for new session
      hasInitializedFromDB.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData, isInitialized]);

  // Handle when React Query fetches a new question (initial mount or difficulty change)
  const prevFetchedQuestionId = useRef<string | null>(null);
  const prevVoicePlayedForQuestion = useRef<string | null>(null);
  useEffect(() => {
    if (!fetchedQuestion || !isInitialized) return;

    // Only update if this is a genuinely new question
    if (prevFetchedQuestionId.current !== fetchedQuestion.id) {
      console.log('📥 New question from React Query:', fetchedQuestion.id);
      prevFetchedQuestionId.current = fetchedQuestion.id;
      setQuestionInStore(fetchedQuestion);

      // Track this question as asked to prevent repeats
      addAskedQuestion(fetchedQuestion.id);

      // Play voice if enabled - but only once per question
      console.log('🔊 Voice check:', {
        tts_enabled,
        tts_voice,
        hasText: !!fetchedQuestion.question_text,
      });
      if (
        tts_enabled &&
        tts_voice &&
        fetchedQuestion.question_text &&
        prevVoicePlayedForQuestion.current !== fetchedQuestion.id
      ) {
        console.log('▶️ Calling playQuestionWithVoice');
        prevVoicePlayedForQuestion.current = fetchedQuestion.id;
        playQuestionWithVoice(fetchedQuestion.question_text, tts_voice);
      } else {
        console.log('⏸️ Voice NOT playing:', {
          tts_enabled,
          tts_voice,
          hasText: !!fetchedQuestion.question_text,
          alreadyPlayed: prevVoicePlayedForQuestion.current === fetchedQuestion.id,
        });
      }
    }
  }, [
    fetchedQuestion,
    isInitialized,
    tts_enabled,
    tts_voice,
    setQuestionInStore,
    playQuestionWithVoice,
    addAskedQuestion,
  ]);

  // Prevent scroll during animations
  useEffect(() => {
    if (isCelebrating || showExplanationModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCelebrating, showExplanationModal]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSelect = useCallback(
    (idx: number) => {
      if (revealed || isDisabled || isTimeout) return;
      setSelected(idx);
    },
    [revealed, isDisabled, isTimeout]
  );

  const handleReveal = useCallback(
    (fromTimeout = false) => {
      console.log('🎯 handleReveal called:', {
        selected,
        fromTimeout,
        revealed,
        questionId: question.id,
      });

      if (selected === undefined && !fromTimeout) {
        console.log('❌ Returning early: no selection');
        return;
      }
      if (revealed) {
        console.log('❌ Returning early: already revealed');
        return;
      }

      const isCorrect = fromTimeout ? false : selected === question.correct_answer_index;
      console.log('✅ Processing answer:', {
        isCorrect,
        selected,
        correctAnswer: question.correct_answer_index,
        fromTimeout,
      });

      setRevealed(true);
      setIsDisabled(true);
      setWasCorrect(isCorrect);
      setIsTimeout(fromTimeout);

      // Celebration animation for correct answers
      if (isCorrect && !fromTimeout) {
        setIsCelebrating(true);
        setTimeout(() => setIsCelebrating(false), 2000);
      }

      // Apply result with optimistic update
      if (isCorrect && !fromTimeout) {
        console.log('🎉 Applying CORRECT result, difficulty:', difficulty);
        applyResult(true, difficulty);
      } else {
        console.log('💔 Applying WRONG result, difficulty:', difficulty);
        // Wrong answer or timeout - reset streak
        applyResult(false, difficulty);
      }

      // Show explanation modal after animation
      const delay = isCorrect && !fromTimeout ? 2000 : 500;
      setTimeout(() => {
        setShowExplanationModal(true);
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, revealed, question.correct_answer_index, applyResult, difficulty]
  );

  const handleNext = useCallback(async () => {
    setShowExplanationModal(false);
    setRevealed(false);
    setSelected(undefined);
    setProgress(1);
    setWasCorrect(null);
    setIsCelebrating(false);
    setIsTimeout(false);
    setIsDisabled(false);
    setQuestionNumber((prev) => prev + 1);

    // Show loading state optimistically
    setQuestionInStore(FALLBACK_QUESTION);

    try {
      // Fetch new question
      const newQuestion = await fetchNewQuestion({ difficulty });
      if (newQuestion) {
        setQuestionInStore(newQuestion);
        // Voice will be played automatically by the useEffect watching fetchedQuestion
      }
    } catch (error) {
      console.error('Failed to load next question:', error);
    }
  }, [fetchNewQuestion, setQuestionInStore, difficulty]);

  // Store handleReveal in a ref to avoid timer restarts
  const handleRevealRef = useRef(handleReveal);
  useEffect(() => {
    handleRevealRef.current = handleReveal;
  }, [handleReveal]);

  // Timer effect with auto-submit on timeout
  useEffect(() => {
    if (revealed || isDisabled || !isInitialized || isQuestionLoading) {
      const currentTimer = timerRef.current;
      if (currentTimer !== undefined) {
        cancelAnimationFrame(currentTimer);
        timerRef.current = undefined;
      }
      return;
    }

    let frame: number | undefined;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.max(0, 1 - elapsed / TIMER_DURATION);
      setProgress(p);

      if (p <= 0 && !revealed && !isTimeout) {
        setIsDisabled(true);
        setIsTimeout(true);
        handleRevealRef.current(true);
        return;
      }

      if (p > 0 && !revealed) {
        frame = requestAnimationFrame(tick);
        timerRef.current = frame;
      }
    };
    frame = requestAnimationFrame(tick);
    timerRef.current = frame;

    return () => {
      const currentTimer = timerRef.current;
      if (currentTimer !== undefined) {
        cancelAnimationFrame(currentTimer);
        timerRef.current = undefined;
      }
    };
  }, [question.id, revealed, isTimeout, isDisabled, isInitialized, isQuestionLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isDisabled || isTimeout) {
        if ((e.key === 'Enter' || e.key === ' ') && showExplanationModal) {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      if (revealed) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4 };
      if (keyMap[e.key] !== undefined && keyMap[e.key] < question.options.length) {
        e.preventDefault();
        handleSelect(keyMap[e.key]);
      }

      if (e.key === 'Enter' && selected !== undefined) {
        e.preventDefault();
        handleReveal();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    selected,
    revealed,
    handleSelect,
    handleReveal,
    handleNext,
    isDisabled,
    isTimeout,
    showExplanationModal,
    question.options.length,
  ]);

  // Get selected and correct options for the modal
  const selectedOption = useMemo(
    () => (selected !== undefined && !isTimeout ? question.options[selected] : undefined),
    [selected, isTimeout, question.options]
  );

  const correctOption = useMemo(
    () => question.options[question.correct_answer_index],
    [question.options, question.correct_answer_index]
  );

  const isLoading = !isHydrated || !isInitialized || isLoadingSession;

  // Show loading spinner during initial load
  // Always show loading state to prevent blank page and hydration issues
  if (isLoading) {
    return (
      <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-6 px-6 py-6 overflow-hidden">
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-purple-800/10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-accent/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-white/80 text-lg font-medium">Loading game...</p>
          <p className="text-white/50 text-sm">Fetching user info, settings, and questions</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-6 overflow-hidden">
      {/* Enhanced background with circular patterns */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-purple-800/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-accent/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start relative z-0">
        <div className="flex-1 space-y-6">
          {/* Header with Settings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-accent2" />
              <h1 className="text-2xl font-bold text-white">AI Trivia Arena</h1>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowSettingsModal(true)}
              iconLeft={<Settings className="h-5 w-5" />}
              className="text-white/80 hover:text-white"
            >
              Settings
            </Button>
          </div>

          <GameHUD
            username={username}
            score={score}
            streak={streak}
            correctCount={correctCount}
            maxStreak={maxStreak}
            isAnimating={isCelebrating}
            wasCorrect={wasCorrect}
          />

          {/* Question Progress */}
          <div className="flex items-center justify-between text-sm text-white/60">
            <span className="font-medium">Question {questionNumber}</span>
            <span className="text-xs">
              {isQuestionLoading
                ? 'Loading question...'
                : isDisabled || isTimeout
                  ? 'Answer locked'
                  : `Use keys 1-${Math.min(question.options.length, 5)} to select, Enter to submit`}
            </span>
          </div>

          {/* Error message */}
          {isQuestionError && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-xl">
              <p className="text-sm text-yellow-400 text-center">
                Failed to load question. Using fallback.
              </p>
            </div>
          )}

          {/* Timer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/70">Time Remaining</span>
              <span
                className={clsx(
                  'text-sm font-bold transition-colors',
                  progress < 0.2 ? 'text-red-400 animate-pulse' : 'text-purple-300'
                )}
              >
                {Math.round(progress * (TIMER_DURATION / 1000))}s
              </span>
            </div>
            <TimerBar progress={progress} />
          </div>

          {/* Question Card */}
          <QuestionCard
            question={question}
            selectedIndex={selected}
            revealed={revealed}
            onSelect={handleSelect}
            explanation={undefined}
            wasCorrect={wasCorrect}
            disabled={isDisabled || isTimeout}
            isLoading={isQuestionLoading}
          />

          <div className="flex justify-center pt-2">
            <Button
              className="px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-accent2 hover:from-purple-500 hover:to-accent shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
              onClick={() => (revealed ? handleNext() : handleReveal())}
              disabled={(!revealed && selected === undefined) || isDisabled || isQuestionLoading}
              iconRight={revealed ? <ArrowRight className="h-5 w-5" /> : undefined}
            >
              {isQuestionLoading
                ? 'Loading...'
                : revealed
                  ? 'Next Question'
                  : isTimeout
                    ? "Time's Up!"
                    : selected === undefined
                      ? 'Select an answer'
                      : 'Submit Answer'}
            </Button>
          </div>
        </div>
        <TopPlayersSidebar />
      </div>

      {/* Celebration overlay */}
      {isCelebrating && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          <div className="animate-[zoomIn_0.5s_ease-in-out]">
            <div className="text-6xl animate-bounce">🎉</div>
            <div className="text-center text-2xl font-bold text-green-400 mt-2 animate-pulse">
              Correct!
            </div>
          </div>
        </div>
      )}

      {/* Question Explanation Modal */}
      <QuestionExplanationModal
        open={showExplanationModal}
        onClose={handleNext}
        question={question.question_text}
        selectedOption={selectedOption}
        selectedIndex={selected}
        correctOption={correctOption}
        correctIndex={question.correct_answer_index}
        explanation={question.explanation}
        wasCorrect={wasCorrect || false}
        pointsGained={wasCorrect && !isTimeout ? getPointsForDifficulty(difficulty) : 0}
        streak={wasCorrect && !isTimeout ? streak : 0}
        isTimeout={isTimeout}
      />

      {/* Settings Modal */}
      <SettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </main>
  );
}
