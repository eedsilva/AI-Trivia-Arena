import { Card } from './Card';

interface FormCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function FormCard({ title, description, children }: FormCardProps) {
  return (
    <Card className="max-w-md space-y-4">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-accent2 shadow-glow">
          <span className="text-2xl">🤖</span>
        </div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        {description && <p className="text-sm text-white/60">{description}</p>}
      </div>
      {children}
    </Card>
  );
}
