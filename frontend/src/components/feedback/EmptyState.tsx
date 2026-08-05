import { Monitor } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <Monitor className="h-16 w-16 text-border" />
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
  );
}
