import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard.js';
import { cn } from '../../lib/utils.js';

interface CopyRoomCodeProps {
  code: string;
}

export default function CopyRoomCode({ code }: CopyRoomCodeProps) {
  const { copyToClipboard } = useClipboard();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
         'flex items-center gap-2 rounded-button px-4 py-2 text-sm font-medium transition-colors',
         copied ? 'bg-success text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      )}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied' : 'Copy Code'}
    </button>
  );
}
