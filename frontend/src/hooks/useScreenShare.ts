import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { roomService } from '../services/room.js';

export function useScreenShare() {
  const [error, setError] = useState<string | null>(null);

  const startSharing = useCallback(async () => {
    setError(null);

    console.log("=== CASTALL SCREEN CAPTURE DIAGNOSTIC ===");
    console.log("secureContext:", window.isSecureContext);
    console.log("protocol:", window.location.protocol);
    console.log("origin:", window.location.origin);
    console.log("mediaDevices:", typeof navigator.mediaDevices);
    console.log("getDisplayMedia:", typeof navigator.mediaDevices?.getDisplayMedia);
    console.log("visibility:", document.visibilityState);
    console.log("focused:", document.hasFocus());
    console.log("userAgent:", navigator.userAgent);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      const message = 'Screen sharing is not available in this browser context. Ensure you are using Google Chrome on Android (not a WebView or restricted browser), the site is served over HTTPS, and screen capture permissions are allowed.';
      setError(message);
      toast.error(message);
      throw new Error(message);
    }

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
      console.error('[useScreenShare] getDisplayMedia error:', {
        name: err instanceof Error ? err.name : undefined,
        message: err instanceof Error ? err.message : String(err),
        constructor: err instanceof Error ? err.constructor?.name : undefined,
        error: err,
        stack: err instanceof Error ? err.stack : undefined,
      });
      const message = err instanceof Error ? err.message : 'Failed to start screen sharing';
      setError(message);
      toast.error(message);
      throw err;
    }
  }, []);

  const stopSharing = useCallback(() => {
    try {
      roomService.stopSharing();
    } catch (err) {
      console.error('[useScreenShare] stopSharing failed:', err);
    }
  }, []);

  return {
    startSharing,
    stopSharing,
    error,
  };
}