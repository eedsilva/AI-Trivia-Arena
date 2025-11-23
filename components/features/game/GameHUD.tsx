import clsx from 'classnames';
import { Shield, Flame, CheckCircle2 } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Avatar } from '../../ui/Avatar';

interface GameHUDProps {
  username: string;
  score: number;
  streak: number;
  correctCount: number;
  maxStreak?: number;
  isAnimating?: boolean;
  wasCorrect?: boolean | null;
}

export function GameHUD({
  username,
  score,
  streak,
  correctCount,
  maxStreak = 0,
  isAnimating,
  wasCorrect,
}: GameHUDProps) {
  const stats = [
    {
      label: 'Score',
      value: score.toLocaleString(),
      icon: Shield,
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      valueColor: 'text-yellow-400',
    },
    {
      label: 'Streak',
      value: `x${streak}`,
      icon: Flame,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      valueColor: 'text-orange-400',
    },
    {
      label: 'Max Streak',
      value: `x${maxStreak}`,
      icon: Flame,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      valueColor: 'text-red-400',
    },
    {
      label: 'Correct',
      value: correctCount.toString(),
      icon: CheckCircle2,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      valueColor: 'text-green-400',
    },
  ];
  return (
    <div
      className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      suppressHydrationWarning
    >
      <Card className="flex items-center gap-3 p-4 md:w-64 bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
        <Avatar name={username} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white/60">Player</p>
          <p className="text-lg font-semibold text-white truncate" suppressHydrationWarning>
            {username}
          </p>
        </div>
      </Card>
      {/* Live Scoreboard showing correct count as per spec */}
      <div className="grid flex-1 grid-cols-4 gap-2 md:gap-3" suppressHydrationWarning>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className={`p-3 md:p-4 text-center ${stat.bgColor} ${stat.borderColor} border backdrop-blur-sm transition-transform hover:scale-105`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.iconColor}`} />
                <p className="text-xs md:text-sm text-white/60 font-medium">{stat.label}</p>
              </div>
              <p
                className={clsx(
                  'text-xl md:text-2xl font-bold transition-all duration-500',
                  stat.valueColor,
                  isAnimating && stat.label === 'Score' && wasCorrect && 'animate-pulse scale-110',
                  isAnimating &&
                    stat.label === 'Streak' &&
                    wasCorrect &&
                    parseInt(stat.value.replace('x', '')) > 1 &&
                    'animate-bounce'
                )}
                suppressHydrationWarning
              >
                {stat.value}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
