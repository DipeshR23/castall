import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 bg-primary overflow-hidden">
      {/* Decorative background ellipses with white stripes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Large ellipse - top left */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 40px)',
          }}
        />
        {/* Medium ellipse - bottom right */}
        <div
          className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.25) 15px, rgba(255,255,255,0.25) 30px)',
          }}
        />
        {/* Small ellipse - center right */}
        <div
          className="absolute top-1/2 right-10 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-15"
          style={{
            background: 'repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(255,255,255,0.2) 12px, rgba(255,255,255,0.2) 24px)',
          }}
        />
      </div>

      {/* Content */}
      {remoteStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 z-10 h-full w-full"
          style={{ objectFit: 'contain' }}
        />
      ) : (
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-center px-4">
          <Spinner size="lg" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-8 mb-4">Waiting for Stream</h2>
          <p className="text-lg sm:text-xl text-white/80 mb-8">The presenter will begin sharing shortly...</p>
          <div className="flex items-center gap-2 text-base text-white/60">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span>No active stream</span>
          </div>
        </div>
      )}

      {/* Disconnect button - top right */}
      <button
        type="button"
        onClick={onDisconnect}
        className="fixed top-4 right-4 z-50 rounded-xl bg-white/10 backdrop-blur-md p-2 sm:p-3 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-150 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Disconnect"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </div>
  );
}
