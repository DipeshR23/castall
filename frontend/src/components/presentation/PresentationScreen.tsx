import { useRef, useEffect } from 'react';
import { X, WifiOff } from 'lucide-react';
import Spinner from '../ui/Spinner.js';

interface PresentationScreenProps {
  remoteStream: MediaStream | null;
  onDisconnect: () => void;
}

export default function PresentationScreen({ remoteStream, onDisconnect }: PresentationScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && remoteStream) {
      video.srcObject = remoteStream;
      video.play().catch(() => {});
    }
  }, [remoteStream]);

  return (
    <div className="fixed inset-0 bg-dark flex items-center justify-center">
      {remoteStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="max-w-full max-h-full w-full h-full"
          style={{ objectFit: 'contain' }}
        />
      ) : (
        <div className="flex flex-col items-center text-center px-4">
          <Spinner size="lg" />
          <h2 className="text-card-title font-semibold text-white mt-6 mb-2">Waiting for Stream</h2>
          <p className="text-small text-gray-300 mb-8">The presenter will begin sharing shortly...</p>
          <div className="flex items-center gap-2 text-small text-gray-400">
            <WifiOff className="h-4 w-4" />
            <span>No active stream</span>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={onDisconnect}
        className="fixed top-4 right-4 z-50 rounded-button bg-dark/60 backdrop-blur-sm p-2 sm:p-3 text-white hover:bg-dark/80 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-150 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Disconnect"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </div>
  );
}
