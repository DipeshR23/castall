import { Monitor, ArrowRight } from 'lucide-react';
import Button from '../ui/Button.js';

interface ScreenRecommendationProps {
  onContinue: () => void;
  isSelecting: boolean;
}

export default function ScreenRecommendation({ onContinue, isSelecting }: ScreenRecommendationProps) {
  return (
    <div className="w-full max-w-sm rounded-card bg-white dark:bg-slate-800 p-8 shadow-soft border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col items-center text-center">
        <Monitor className="h-12 w-12 text-primary mb-4" />
        <h2 className="text-card-title font-semibold text-slate-900 dark:text-white mb-2">Select Your Screen</h2>
        <p className="text-small text-slate-500 dark:text-slate-400 mb-2">
          For the best presentation experience, select:
        </p>
        <p className="text-section-title font-semibold text-primary mb-6">
          Entire Screen
        </p>
        <p className="text-small text-slate-500 dark:text-slate-400 mb-8">
          This ensures your entire screen is shared without cropping or missing content.
        </p>
        <Button onClick={onContinue} disabled={isSelecting} className="flex items-center gap-2 w-full sm:w-auto">
          <ArrowRight className="h-5 w-5" />
          {isSelecting ? 'Opening...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
