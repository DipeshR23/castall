import { cn } from '../../lib/utils.js';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={cn('animate-spin rounded-full border-primary border-t-transparent', sizeClasses[size], className)}
      role="status"
      aria-label="Loading"
    />
  );
}
