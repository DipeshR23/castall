import { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export default function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={`flex items-center justify-center min-h-[calc(100vh-72px)] w-full px-4 py-6 sm:py-8 md:py-12 ${className || ''}`}>
      <div className="w-full max-w-content">
        {children}
      </div>
    </div>
  );
}
