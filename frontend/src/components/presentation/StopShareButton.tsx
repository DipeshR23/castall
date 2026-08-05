import { Square } from 'lucide-react';
import Button from '../ui/Button.js';

interface StopShareButtonProps {
  onClick: () => void;
}

export default function StopShareButton({ onClick }: StopShareButtonProps) {
  return (
    <Button variant="danger" onClick={onClick} className="flex items-center gap-2">
      <Square className="h-5 w-5" />
      Stop Sharing
    </Button>
  );
}
