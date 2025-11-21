import { User2 } from 'lucide-react';

interface AvatarProps {
  name?: string;
}

export function Avatar({ name }: AvatarProps) {
  const initials = name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white/80 shadow-glow">
      {initials || <User2 className="h-6 w-6" />}
    </div>
  );
}
