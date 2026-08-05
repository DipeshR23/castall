import { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

export default function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false, className }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-button px-6 py-3 font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[44px]';

  const variants = {
    primary: 'bg-primary text-white shadow-soft hover:shadow-soft-hover',
    secondary: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700',
    danger: 'bg-transparent border border-error text-error hover:bg-error/10',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], className)}
    >
      {children}
    </button>
  );
}
