import Spinner from '../ui/Spinner.js';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
