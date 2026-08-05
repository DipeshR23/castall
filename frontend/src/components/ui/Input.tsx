import { forwardRef } from 'react';
import { cn } from '../../lib/utils.js';

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-button border border-border bg-background px-4 py-3 text-dark placeholder:text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
