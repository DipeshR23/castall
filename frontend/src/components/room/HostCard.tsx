import QRCodeCard from '../qr/QRCodeCard.js';
import { Copy, RefreshCw } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard.js';
import { useState, useEffect } from 'react';

interface HostCardProps {
  roomCode: string | null;
  status: string | null;
  incomingDevice: string | null;
  expiresIn: number | null;
  onAccept: () => void;
  onReject: () => void;
  onReset: () => void;
  onBack: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function HostCard({ roomCode, status, incomingDevice, expiresIn, onAccept, onReject, onReset, onBack }: HostCardProps) {
  const qrValue = roomCode ? `${window.location.origin}/share?room=${roomCode}` : '';
  const { copyToClipboard } = useClipboard();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresIn || expiresIn <= 0) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(expiresIn);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresIn]);

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
  };

  if (status === 'REQUESTED' && incomingDevice) {
    return (
      <div className="w-full">
        <div className="w-full rounded-3xl sm:rounded-[32px] bg-white p-8 sm:p-10 md:p-12 shadow-sm border border-slate-100">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 mb-2 sm:mb-3">Incoming Presentation</h2>
            <p className="text-base sm:text-lg text-slate-500 mb-6 sm:mb-8">{incomingDevice}</p>
            <div className="flex gap-3 sm:gap-4 w-full">
              <button
                type="button"
                onClick={onAccept}
                className="flex-1 rounded-xl sm:rounded-2xl bg-primary px-4 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[52px]"
                aria-label="Accept presentation request"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={onReject}
                className="flex-1 rounded-xl sm:rounded-2xl bg-white border-2 border-slate-200 px-4 py-3 sm:py-4 text-base sm:text-lg font-semibold text-slate-600 hover:text-slate-900 transition-colors duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[52px]"
                aria-label="Decline presentation request"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full rounded-3xl sm:rounded-[32px] bg-white p-8 sm:p-10 md:p-12 shadow-sm border border-slate-100">
        <div className="flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-2">Host Presentation</h2>
          <p className="text-base sm:text-lg text-slate-500 mb-8 sm:mb-10">Receiver device</p>

          {/* QR Code Container */}
          <div className="bg-white rounded-3xl sm:rounded-[32px] p-4 sm:p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-slate-100 mb-4 sm:mb-6">
            <QRCodeCard value={qrValue} size={220} />
          </div>

          <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8">Scan with your phone or laptop camera</p>

          {/* Divider */}
          <div className="w-full h-px bg-slate-200 mb-6 sm:mb-8" />

          {/* Room Code Section */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">Room Code</p>
            <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary tracking-wider mb-4 sm:mb-6">{roomCode}</p>
            <button
              type="button"
              onClick={() => handleCopy(roomCode || '')}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-slate-700 hover:bg-slate-50 transition-all duration-150 min-h-[44px]"
            >
              <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
              Copy Code
            </button>
          </div>

          {/* Waiting Status */}
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
            </div>
            <p className="text-sm sm:text-base text-slate-600 font-medium">Waiting for Presenter...</p>
          </div>

          {/* Expiry Countdown */}
          {timeLeft !== null && timeLeft > 0 && (
            <p className="text-xs sm:text-sm text-slate-400 mb-6 sm:mb-8">
              Room expires in {formatTime(timeLeft)} if unused
            </p>
          )}

          {/* Action Buttons */}
          <div className="w-full space-y-3 sm:space-y-4">
            <button
              type="button"
              onClick={onReset}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border-2 border-slate-200 bg-white px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-semibold text-primary hover:bg-slate-50 transition-all duration-150 min-h-[52px]"
            >
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
              Reset Room
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border-2 border-slate-200 bg-white px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-150 min-h-[52px]"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
