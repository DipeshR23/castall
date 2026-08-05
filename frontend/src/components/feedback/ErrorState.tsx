import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button.js';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <AlertTriangle className="h-12 w-12 text-error" />
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="text-slate-500 dark:text-slate-400">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
