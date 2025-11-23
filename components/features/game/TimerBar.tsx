interface TimerBarProps {
  progress: number; // 0 to 1
}

export function TimerBar({ progress }: TimerBarProps) {
  const progressPercent = Math.min(Math.max(progress, 0), 1) * 100;
  const isLowTime = progressPercent < 30;

  return (
    <div className="h-4 w-full overflow-hidden rounded-full bg-white/10 border border-white/5">
      <div
        className={`
          h-full rounded-full transition-all duration-300 ease-linear
          ${
            isLowTime
              ? 'bg-gradient-to-r from-red-500 via-red-400 to-orange-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
              : 'bg-gradient-to-r from-purple-500 via-purple-400 to-accent2 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
          }
        `}
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );
}
