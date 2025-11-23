import { User2 } from 'lucide-react';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-lg',
  lg: 'h-16 w-16 text-xl',
};

// Generate consistent color based on name
const getAvatarColor = (name?: string) => {
  if (!name) return 'bg-white/10';

  const colors = [
    'bg-gradient-to-br from-green-400 to-green-600',
    'bg-gradient-to-br from-yellow-400 to-yellow-600',
    'bg-gradient-to-br from-orange-400 to-orange-600',
    'bg-gradient-to-br from-blue-400 to-blue-600',
    'bg-gradient-to-br from-purple-400 to-purple-600',
    'bg-gradient-to-br from-pink-400 to-pink-600',
  ];

  // Simple hash function to get consistent color for same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const initials = name
    ?.split(/[\s_-]/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const bgColor = getAvatarColor(name);
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`flex ${sizeClass} items-center justify-center rounded-full ${bgColor} text-white font-semibold shadow-lg border-2 border-white/20 flex-shrink-0`}
    >
      {initials || (
        <User2 className={`${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'}`} />
      )}
    </div>
  );
}
