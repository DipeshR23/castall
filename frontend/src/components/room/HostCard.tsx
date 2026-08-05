import QRCodeCard from '../qr/QRCodeCard.js';
import { Copy, Users } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard.js';
import { useState } from 'react';

interface HostCardProps {
  roomCode: string | null;
  status: string | null;
  incomingDevice: string | null;
  onAccept: () => void;
  onReject: () => void;
  onReset: () => void;
}

export default function HostCard({ roomCode, status, incomingDevice, onAccept, onReject, onReset }: HostCardProps) {
  const qrValue = roomCode ? `${window.location.origin}/share?room=${roomCode}` : '';
  const { copyToClipboard } = useClipboard();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === 'REQUESTED' && incomingDevice) {
    return (
      <div className="flex flex-col items-center w-full px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Incoming Presentation</h2>
            <p className="text-sm text-slate-500 mb-6">{incomingDevice}</p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={onAccept}
                className="flex-1 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[44px]"
                aria-label="Accept presentation request"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={onReject}
                className="flex-1 rounded-xl bg-white border border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:text-slate-900 transition-colors duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[44px]"
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
    <div className="flex flex-col items-center w-full px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Room Created 🎉</h2>
          <p className="text-sm text-slate-500 mb-6">Share this QR code to invite others</p>
          
          <div className="mb-6 w-full flex justify-center">
            <QRCodeCard value={qrValue} size={180} />
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-lg font-bold text-primary tracking-wider">{roomCode}</span>
            <button
              type="button"
              onClick={() => handleCopy(roomCode || '')}
              className="rounded-lg p-2 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={copied ? 'Copied' : 'Copy room code'}
            >
              {copied ? <Copy className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-slate-400" />}
            </button>
          </div>
          
          <p className="text-sm text-slate-400 mb-6" role="status" aria-live="polite">
            Waiting for presenter to connect...
          </p>
          
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <span className="text-sm text-slate-500">Share Link</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 truncate max-w-[200px]">{window.location.origin}/share?room={roomCode}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(`${window.location.origin}/share?room=${roomCode}`)}
                  className="rounded-lg p-2 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Copy share link"
                >
                  {copied ? <Copy className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-slate-400" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <span className="text-sm text-slate-500">Connected Devices</span>
              <div className="flex items-center gap-1 text-slate-400">
                <Users className="h-4 w-4" />
                <span className="text-sm">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border border-error text-error px-6 py-3 font-semibold hover:bg-error/5 transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 min-h-[44px]"
        >
          End Room
        </button>
      </div>
    </div>
  );
}
