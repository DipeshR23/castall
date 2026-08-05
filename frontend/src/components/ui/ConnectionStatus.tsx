import { WifiOff, Wifi } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export default function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  if (isConnected) {
    return (
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-badge bg-success/10 px-3 py-1.5 text-small text-success">
        <Wifi className="h-4 w-4" />
        <span>Connected</span>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-badge bg-error/10 px-3 py-1.5 text-small text-error">
      <WifiOff className="h-4 w-4" />
      <span>Disconnected</span>
    </div>
  );
}
