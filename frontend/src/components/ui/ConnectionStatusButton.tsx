import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusButtonProps {
  connected: boolean;
  label?: string;
}

export default function ConnectionStatusButton({ connected, label }: ConnectionStatusButtonProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-button border px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors duration-150 ${
        connected
          ? 'border-success/40 bg-success/10 text-success'
          : 'border-error/40 bg-error/10 text-error'
      }`}
    >
      {connected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
      <span className="hidden xs:inline">{label ?? (connected ? 'Connected' : 'Disconnected')}</span>
    </div>
  );
}
