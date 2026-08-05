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
  const [copiedCode, setCopiedCode] = useState(false);

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
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (status === 'REQUESTED' && incomingDevice) {
    return (
      <div className="w-full">
        <div className="w-full rounded-card bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-soft border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col items-center">
            <h2 className="text-card-title font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">Incoming Presentation</h2>
            <p className="text-small text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">{incomingDevice}</p>
            <div className="flex gap-3 sm:gap-4 w-full">
              <button
                type="button"
                onClick={onAccept}
                className="flex-1 rounded-button bg-primary px-4 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[52px]"
                aria-label="Accept presentation request"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={onReject}
                className="flex-1 rounded-button bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-3 sm:py-4 text-base sm:text-lg font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[52px]"
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
      <div className="w-full rounded-card bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-soft border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center">
          <h2 className="text-card-title font-semibold text-slate-900 dark:text-white mb-2">Host Presentation</h2>
          <p className="text-small text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">Receiver device</p>

          {/* QR Code Container */}
          <div className="bg-white dark:bg-slate-800 rounded-card p-4 sm:p-6 shadow-soft border border-slate-200 dark:border-slate-700 mb-4 sm:mb-6">
            <QRCodeCard value={qrValue} size={220} />
          </div>

          <p className="text-small text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">Scan with your phone or laptop camera</p>

          {/* Divider */}
          <div className="w-full h-px bg-slate-200 dark:bg-slate-700 mb-6 sm:mb-8" />

          {/* Room Code Section */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-caption font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 sm:mb-3">Room Code</p>
            <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary tracking-wider mb-4 sm:mb-6">{roomCode}</p>
            <button
              type="button"
              onClick={() => handleCopy(roomCode || '')}
              className={`inline-flex items-center gap-2 rounded-button border-2 px-4 sm:px-5 py-2.5 sm:py-3 text-small font-medium transition-all duration-150 min-h-[44px] ${copiedCode
                ? 'border-success bg-success/10 text-success'
                : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
            >
              <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          {/* Waiting Status */}
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
            </div>
            <p className="text-small text-slate-600 dark:text-slate-300 font-medium">Waiting for Presenter</p>
          </div>

          {/* Expiry Countdown */}
          {timeLeft !== null && timeLeft > 0 && (
            <p className="text-caption text-slate-400 dark:text-slate-500 mb-6 sm:mb-8">
              Room expires in {formatTime(timeLeft)} if unused
            </p>
          )}

          {/* Action Buttons */}
          <div className="w-full space-y-3 sm:space-y-4">
            <button
              type="button"
              onClick={onReset}
              className="w-full inline-flex items-center justify-center gap-2 rounded-button border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-semibold text-primary hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-150 min-h-[52px]"
            >
              <RefreshCw className="h-15 w-15 sm:h-5 sm:w-5" />
              Reset Room
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full inline-flex items-center justify-center gap-2 rounded-button border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-150 min-h-[52px]"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
