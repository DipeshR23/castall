import { X } from 'lucide-react';

interface DisconnectButtonProps {
  onClick: () => void;
}

export default function DisconnectButton({ onClick }: DisconnectButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed top-4 right-4 z-50 rounded-button bg-dark/50 p-2 text-white opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
      aria-label="Disconnect"
    >
      <X className="h-6 w-6" />
    </button>
  );
}
