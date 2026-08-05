import { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-card bg-surface p-6 shadow-soft border border-border', className)}>
      {children}
    </div>
  );
}
