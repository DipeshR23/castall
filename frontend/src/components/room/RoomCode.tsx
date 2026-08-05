import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard.js';
import { cn } from '../../lib/utils.js';

interface RoomCodeProps {
  code: string | null;
}

export default function RoomCode({ code }: RoomCodeProps) {
  const { copyToClipboard } = useClipboard();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!code) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      <span className="text-2xl font-mono font-bold tracking-widest text-slate-900 dark:text-white">{code}</span>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'rounded-button p-2 transition-colors duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center',
          copied ? 'bg-success text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
        )}
        aria-label={copied ? 'Copied' : 'Copy room code'}
      >
        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
      </button>
    </div>
  );
}
