import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { roomService } from '../services/room.js';

export function useScreenShare() {
  const [error, setError] = useState<string | null>(null);

  const startSharing = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          roomService.stopSharing();
        };
      }

      roomService.startSharing();
      return stream;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start screen sharing';
      setError(message);
      toast.error(message);
      throw err;
    }
  }, []);

  const stopSharing = useCallback(() => {
    try {
      roomService.stopSharing();
    } catch {
      // ignore
    }
  }, []);

  return {
    startSharing,
    stopSharing,
    error,
  };
}