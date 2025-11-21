interface TimerBarProps {
  progress: number; // 0 to 1
}

export function TimerBar({ progress }: TimerBarProps) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent to-accent2 transition-all duration-300"
        style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
      />
    </div>
  );
}
