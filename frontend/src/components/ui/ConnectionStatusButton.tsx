import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusButtonProps {
  connected: boolean;
  label?: string;
}

export default function ConnectionStatusButton({ connected, label }: ConnectionStatusButtonProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-button border px-3 py-2 text-xs sm:text-sm font-medium transition-colors duration-150 min-h-[44px] min-w-[44px] ${
        connected
          ? 'border-success/40 bg-success/10 text-success'
          : 'border-error/40 bg-error/10 text-error'
      }`}
    >
      {connected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
      <span className="hidden sm:inline">{label ?? (connected ? 'Connected' : 'Disconnected')}</span>
    </div>
  );
}
