import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CameraOff } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function QRCodeScanner({ onScan, onClose }: QRCodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear().catch(() => {});
      },
      (scanError) => {
        setError(scanError);
      }
    );

    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4">
      <div className="w-full max-w-sm rounded-card bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-soft">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Scan QR Code</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-button p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95"
            aria-label="Close scanner"
          >
            <CameraOff className="h-5 w-5" />
          </button>
        </div>
        <div id="qr-reader" className="w-full overflow-hidden rounded-button" />
        {error && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center">Point camera at QR code</p>}
        <p className="mt-3 sm:mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
          Please enter Room Code manually if camera is unavailable.
        </p>
      </div>
    </div>
  );
}
