import { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-card bg-white dark:bg-slate-800 p-6 shadow-soft border border-slate-200 dark:border-slate-700', className)}>
      {children}
    </div>
  );
}
