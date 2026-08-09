import { useRef, useEffect, useState } from 'react';
import Spinner from '../ui/Spinner.js';
import BackgroundEffects from './BackgroundEffects.js';

interface PresentationScreenProps {
  remoteStream: MediaStream | null;
  sessionEnded?: boolean;
  sessionEndMessage?: string;
}

export default function PresentationScreen({ remoteStream, sessionEnded, sessionEndMessage }: PresentationScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video && remoteStream) {
      video.srcObject = remoteStream;
      setAutoplayBlocked(false);
      video.play().catch(() => {
        setAutoplayBlocked(true);
      });
    }
  }, [remoteStream]);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (video) {
      video.play().then(() => setAutoplayBlocked(false)).catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <BackgroundEffects topOffset={72} />

      {/* Content */}
      {remoteStream ? (
        <div className="absolute inset-0 z-10" onClick={autoplayBlocked ? handleVideoClick : undefined} style={{ cursor: autoplayBlocked ? 'pointer' : 'default' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute top-[72px] left-0 right-0 bottom-0 h-full w-full"
            style={{ objectFit: 'contain' }}
          />
          {autoplayBlocked && (
            <div className="absolute inset-0 top-[72px] flex items-center justify-center bg-black/30">
              <div className="rounded-card bg-white/90 dark:bg-slate-800/90 px-6 py-4 text-center shadow-soft">
                <p className="text-base font-medium text-slate-900 dark:text-white mb-2">Tap to play</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Autoplay was blocked by your browser.</p>
              </div>
            </div>
          )}
        </div>
      ) : sessionEnded ? (
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-center px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Session Ended</h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300">{sessionEndMessage}</p>
        </div>
      ) : (
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-center px-4">
          <Spinner size="lg" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Waiting for Stream</h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8">The presenter will begin sharing shortly...</p>
          <div className="flex items-center gap-2 text-base text-slate-500 dark:text-slate-400">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span>No active stream</span>
          </div>
        </div>
      )}
    </div>
  );
}
