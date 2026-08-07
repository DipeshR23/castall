import { useRef, useEffect } from 'react';
import Spinner from '../ui/Spinner.js';

interface PresentationScreenProps {
  remoteStream: MediaStream | null;
  sessionEnded?: boolean;
  sessionEndMessage?: string;
}

export default function PresentationScreen({ remoteStream, sessionEnded, sessionEndMessage }: PresentationScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && remoteStream) {
      video.srcObject = remoteStream;
      video.play().catch(() => {});
    }
  }, [remoteStream]);

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Smoke background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Light mode smoke */}
        <div className="dark:hidden">
          <div className="absolute -top-20 -left-20 w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] rounded-full bg-slate-200/60 blur-[100px] animate-[smoke-drift-1_22s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 -right-20 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-200/50 blur-[90px] animate-[smoke-drift-2_26s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 left-1/4 w-[65vw] h-[65vw] max-w-[650px] max-h-[650px] rounded-full bg-slate-100/70 blur-[110px] animate-[smoke-drift-3_20s_ease-in-out_infinite]" />
          <div className="absolute top-2/3 right-1/4 w-[55vw] h-[55vw] max-w-[550px] max-h-[550px] rounded-full bg-blue-100/40 blur-[80px] animate-[smoke-drift-4_24s_ease-in-out_infinite]" />
        </div>

        {/* Dark mode smoke */}
        <div className="hidden dark:block">
          <div className="absolute -top-20 -left-20 w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] rounded-full bg-blue-500/25 blur-[100px] animate-[smoke-drift-1_22s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 -right-20 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-400/20 blur-[90px] animate-[smoke-drift-2_26s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 left-1/4 w-[65vw] h-[65vw] max-w-[650px] max-h-[650px] rounded-full bg-slate-700/30 blur-[110px] animate-[smoke-drift-3_20s_ease-in-out_infinite]" />
          <div className="absolute top-2/3 right-1/4 w-[55vw] h-[55vw] max-w-[550px] max-h-[550px] rounded-full bg-blue-600/15 blur-[80px] animate-[smoke-drift-4_24s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Decorative background ellipses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Light mode ellipses */}
        <div className="dark:hidden">
          {/* Large ellipse - top left */}
          <div
            className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
            style={{
              background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(37,99,235,0.25) 20px, rgba(37,99,235,0.25) 40px)',
            }}
          />
          {/* Medium ellipse - bottom right */}
          <div
            className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full opacity-20"
            style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(37,99,235,0.22) 15px, rgba(37,99,235,0.22) 30px)',
            }}
          />
          {/* Small ellipse - center right */}
          <div
            className="absolute top-1/2 right-10 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-15"
            style={{
              background: 'repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(37,99,235,0.2) 12px, rgba(37,99,235,0.2) 24px)',
            }}
          />
        </div>

        {/* Dark mode ellipses */}
        <div className="hidden dark:block">
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
