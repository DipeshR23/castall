import { useState } from 'react';
import { Camera } from 'lucide-react';
import QRCodeScanner from '../qr/QRCodeScanner.js';
import { roomCodeSchema } from '../../utils/validators.js';

interface JoinCardProps {
  onConnect: (roomCode: string) => void;
  deviceName: string;
  onDeviceNameChange: (name: string) => void;
  isJoining: boolean;
}

export default function JoinCard({ onConnect, deviceName, onDeviceNameChange, isJoining }: JoinCardProps) {
  const [code, setCode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = roomCodeSchema.safeParse(code);
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Invalid room code');
      return;
    }
    onConnect(result.data);
  };

  const handleScan = (scannedCode: string) => {
    const result = roomCodeSchema.safeParse(scannedCode);
    if (result.success) {
      setCode(result.data);
      setShowScanner(false);
    }
  };

  return (
    <div className="w-full rounded-card bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-soft border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
        <h1 className="text-card-title font-semibold text-slate-900 dark:text-white mb-2">Share your screen</h1>
        <p className="text-small text-slate-500 dark:text-slate-400">Join an existing room to start presenting.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6" noValidate>
        <div>
          <label htmlFor="deviceName" className="block text-small font-medium text-slate-700 dark:text-slate-300 mb-2">
            Device Name (Optional)
          </label>
          <input
            id="deviceName"
            type="text"
            value={deviceName}
            onChange={(e) => onDeviceNameChange(e.target.value)}
            placeholder="e.g., Windows Laptop"
            maxLength={50}
            aria-describedby="deviceNameHelp"
            className="w-full rounded-input border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder:text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[52px]"
          />
          <p id="deviceNameHelp" className="mt-1.5 text-caption text-slate-400 dark:text-slate-500">This name will be visible to the host and other participants.</p>
        </div>

        <div className="flex items-center justify-center py-2">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="px-4 text-small text-slate-400 dark:text-slate-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        <div>
          <label htmlFor="roomCode" className="block text-small font-medium text-slate-700 dark:text-slate-300 mb-2">
            Room Code
          </label>
          <input
            id="roomCode"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="A7K4P2"
            maxLength={6}
            aria-invalid={!!error}
            aria-describedby={error ? 'roomCodeError' : undefined}
            aria-required="true"
            className="w-full rounded-input border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-center text-lg sm:text-xl font-mono tracking-widest uppercase text-slate-900 dark:text-white placeholder:text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[52px]"
          />
          {error && <p id="roomCodeError" className="mt-1.5 text-caption text-error" role="alert">{error}</p>}
        </div>

        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="w-full flex items-center justify-center gap-2 rounded-button border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-small font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-150 min-h-[52px]"
        >
          <Camera className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          Scan QR Code
        </button>

        <button
          type="submit"
          disabled={isJoining}
          className="w-full rounded-button bg-primary px-4 py-3 text-base sm:text-lg font-semibold text-white hover:bg-primary-hover transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center gap-2"
        >
          {isJoining ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Connecting...
            </>
          ) : (
            <>
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Connect
            </>
          )}
        </button>
      </form>

      {showScanner && (
        <QRCodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
