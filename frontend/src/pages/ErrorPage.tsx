import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import Button from '../components/ui/Button.js';

export default function ErrorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || 'UNKNOWN_ERROR';

  const errorMessages: Record<string, { title: string; description: string }> = {
    ROOM_NOT_FOUND: {
      title: 'Room not found',
      description: 'This room does not exist or has been removed.',
    },
    ROOM_EXPIRED: {
      title: 'Room expired',
      description: 'This room has expired. Please ask the host to create a new room.',
    },
    ROOM_FULL: {
      title: 'Room already in use',
      description: 'This room already has an active presenter.',
    },
    HOST_OFFLINE: {
      title: 'Host unavailable',
      description: 'The host is no longer connected. Please try again later.',
    },
    PERMISSION_DENIED: {
      title: 'Permission denied',
      description: 'Screen sharing permission was denied. Please allow access and try again.',
    },
    CONNECTION_LOST: {
      title: 'Connection lost',
      description: 'Connection lost. Attempting to reconnect...',
    },
    SIGNALING_FAILED: {
      title: 'Connection failed',
      description: 'Unable to establish a presentation session. Please try again.',
    },
    UNKNOWN_ERROR: {
      title: 'Something went wrong',
      description: 'An unexpected error occurred. Please try again.',
    },
  };

  const error = errorMessages[code] || errorMessages.UNKNOWN_ERROR;

  if (code === 'ROOM_NOT_FOUND' || code === 'ROOM_EXPIRED') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-72px)] px-4">
      <div className="w-full max-w-content rounded-card bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-soft border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-card-title font-semibold text-slate-900 dark:text-white mb-2">{error.title}</h1>
          <p className="text-small text-slate-500 dark:text-slate-400 mb-6">{error.description}</p>
          <Button onClick={() => navigate('/')} className="flex items-center gap-2">
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
