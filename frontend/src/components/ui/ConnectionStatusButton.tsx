import { Link, Unlink } from 'lucide-react';

interface ConnectionStatusButtonProps {
  connected?: boolean;
  label?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  hoverable?: boolean;
}

export default function ConnectionStatusButton({ connected, label, onClick, icon, hoverable = false }: ConnectionStatusButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-button border px-3 py-2 text-xs sm:text-sm font-medium transition-colors duration-150 min-h-[44px] min-w-[44px] ${
        connected
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-error/40 bg-error/10 text-error'
      } ${hoverable ? 'hover:bg-error/20 hover:border-error/60' : ''}`}
    >
      {connected ? <Link className="h-5 w-5" /> : (icon ?? <Unlink className="h-5 w-5" />)}
      <span className="hidden sm:inline">{label ?? (connected ? 'Connected' : 'Disconnected')}</span>
    </button>
  );
}
