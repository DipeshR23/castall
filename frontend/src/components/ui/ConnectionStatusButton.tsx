import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusButtonProps {
  connected?: boolean;
  label?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export default function ConnectionStatusButton({ connected, label, onClick, icon }: ConnectionStatusButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-button border px-3 py-2 text-xs sm:text-sm font-medium transition-colors duration-150 min-h-[44px] min-w-[44px] ${
        connected
          ? 'border-success/40 bg-success/10 text-success hover:bg-success/20 hover:border-success/60'
          : 'border-error/40 bg-error/10 text-error hover:bg-error/20 hover:border-error/60'
      }`}
    >
      {connected ? <Wifi className="h-5 w-5" /> : (icon ?? <WifiOff className="h-5 w-5" />)}
      <span className="hidden sm:inline">{label ?? (connected ? 'Connected' : 'Disconnected')}</span>
    </button>
  );
}
