import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Image, CameraOff, Upload } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

type ScanMode = 'idle' | 'camera' | 'file';

export default function QRCodeScanner({ onScan, onClose }: QRCodeScannerProps) {
  const [mode, setMode] = useState<ScanMode>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {
        // ignore stop errors
      }
      html5QrCodeRef.current = null;
      setIsScanning(false);
    }
    setMode('idle');
    setError(null);
    setImagePreview(null);
  }, [isScanning]);

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  const startCamera = async () => {
    setError(null);
    setImagePreview(null);

    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
    }

    try {
      const cameraId = await Html5Qrcode.getCameras();
      if (!cameraId || cameraId.length === 0) {
        setError('No camera found on this device.');
        return;
      }

      const backCamera = cameraId.find((cam) => cam.label.toLowerCase().includes('back'))?.id || cameraId[0].id;

      await html5QrCodeRef.current.start(
        backCamera,
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1,
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        () => {
          // ignore continuous scan errors
        }
      );

      setIsScanning(true);
      setMode('camera');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start camera';
      if (message.includes('Permission') || message.includes('NotAllowed')) {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (message.includes('NotFound') || message.includes('DevicesNotFoundError')) {
        setError('No camera found on this device.');
      } else {
        setError('Unable to access camera. Please check permissions and try again.');
      }
      setIsScanning(false);
      setMode('idle');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setImagePreview(null);

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
    }

    try {
      const decodedText = await html5QrCodeRef.current.scanFile(file, false);
      onScan(decodedText);
      await stopScanner();
    } catch {
      setError('No QR code found in this image. Please try another image.');
      setMode('file');
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4">
      <div className="w-full max-w-md rounded-card bg-white dark:bg-slate-800 shadow-soft border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Scan QR Code</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-button p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95"
            aria-label="Close scanner"
          >
            <CameraOff className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {mode === 'idle' && (
            <div className="flex flex-col gap-3">
              <p className="text-small text-slate-500 dark:text-slate-400 text-center mb-2">
                Choose how you want to scan the QR code
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-2 rounded-button bg-primary px-4 py-3 text-base font-semibold text-white hover:bg-primary-hover transition-all duration-150 min-h-[52px]"
              >
                <Camera className="h-5 w-5" />
                Scan with Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-button border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-150 min-h-[52px]"
              >
                <Image className="h-5 w-5" />
                Scan from Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-caption text-slate-400 dark:text-slate-500 text-center">
                Please enter Room Code manually if scanning is unavailable.
              </p>
            </div>
          )}

          {mode === 'camera' && (
            <div className="flex flex-col gap-3">
              <div id="qr-reader" className="w-full overflow-hidden rounded-button" />
              {error && (
                <div className="rounded-button bg-error/10 p-3 text-center">
                  <p className="text-small text-error">{error}</p>
                </div>
              )}
              <button
                type="button"
                onClick={stopScanner}
                className="w-full flex items-center justify-center gap-2 rounded-button border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-150 min-h-[52px]"
              >
                <CameraOff className="h-5 w-5" />
                Stop Camera
              </button>
            </div>
          )}

          {mode === 'file' && (
            <div className="flex flex-col gap-3">
              {imagePreview && (
                <div className="flex items-center justify-center">
                  <img src={imagePreview} alt="Selected QR" className="max-h-[260px] rounded-button border border-slate-200 dark:border-slate-700" />
                </div>
              )}
              {error && (
                <div className="rounded-button bg-error/10 p-3 text-center">
                  <p className="text-small text-error">{error}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-button border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-150 min-h-[52px]"
              >
                <Upload className="h-5 w-5" />
                Choose Another Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
