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
    <div className="flex items-center justify-center min-h-[calc(100vh-72px)] px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl rounded-3xl sm:rounded-[32px] bg-white p-8 sm:p-10 md:p-12 shadow-sm border border-slate-100">
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">Share your screen</h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-md">Join an existing room to start presenting.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8" noValidate>
          <div>
            <label htmlFor="deviceName" className="block text-base sm:text-lg font-medium text-slate-700 mb-2 sm:mb-3">
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[56px] text-base sm:text-lg"
            />
            <p id="deviceNameHelp" className="mt-2 text-sm text-slate-400">This name will be visible to the host and other participants.</p>
          </div>

          <div className="flex items-center justify-center py-3 sm:py-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="px-4 sm:px-6 text-sm sm:text-base text-slate-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div>
            <label htmlFor="roomCode" className="block text-base sm:text-lg font-medium text-slate-700 mb-2 sm:mb-3">
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-xl sm:text-2xl font-mono tracking-widest uppercase placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[56px]"
            />
            {error && <p id="roomCodeError" className="mt-2 text-sm text-error" role="alert">{error}</p>}
          </div>

          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-base sm:text-lg font-medium text-slate-700 hover:bg-slate-50 transition-all duration-150 min-h-[56px]"
          >
            <Camera className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            Scan QR Code
          </button>

          <button
            type="submit"
            disabled={isJoining}
            className="w-full rounded-2xl bg-primary px-5 py-4 text-lg sm:text-xl font-semibold text-white hover:bg-primary-hover transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] flex items-center justify-center gap-3"
          >
            {isJoining ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    </div>
  );
}
