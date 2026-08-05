import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Image, CameraOff, Upload, Loader2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRCodeScannerProps {
  onScan: (code: string) => Promise<boolean>;
  onClose: () => void;
}

type ScanMode = 'idle' | 'camera' | 'file';

export default function QRCodeScanner({ onScan, onClose }: QRCodeScannerProps) {
  const [mode, setMode] = useState<ScanMode>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isScanningFile, setIsScanningFile] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraReaderRef = useRef<HTMLDivElement>(null);
  const cameraScannerRef = useRef<Html5Qrcode | null>(null);
  const fileScannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);

  const stopCamera = useCallback(async () => {
    if (cameraScannerRef.current) {
      try {
        await cameraScannerRef.current.stop();
      } catch {
        // ignore
      }
      cameraScannerRef.current = null;
    }
    if (mountedRef.current) {
      setCameraReady(false);
    }
  }, []);

  const cleanupFileScanner = useCallback(() => {
    if (fileScannerRef.current) {
      try {
        fileScannerRef.current.clear();
      } catch {
        // ignore
      }
      fileScannerRef.current = null;
    }
    if (mountedRef.current) {
      setIsScanningFile(false);
      setImagePreview(null);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      void stopCamera();
      cleanupFileScanner();
    };
  }, [stopCamera, cleanupFileScanner]);

  const handleClose = useCallback(async () => {
    await stopCamera();
    cleanupFileScanner();
    onClose();
  }, [onClose, stopCamera, cleanupFileScanner]);

  const startCamera = useCallback(async () => {
    setError(null);
    setCameraReady(false);

    if (!cameraReaderRef.current) {
      setError('Scanner container not ready. Please try again.');
      return;
    }

    try {
      if (!cameraScannerRef.current) {
        cameraScannerRef.current = new Html5Qrcode('qr-reader-camera');
      }

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setError('No camera found on this device.');
        return;
      }

      const backCamera = cameras.find((cam) => cam.label.toLowerCase().includes('back'))?.id || cameras[0].id;

      await cameraScannerRef.current.start(
        backCamera,
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          if (!mountedRef.current) return;
          try {
            const success = await onScan(decodedText);
            if (success && mountedRef.current) {
              void handleClose();
            }
          } catch {
            if (mountedRef.current) {
              setError('Failed to connect. Please try again.');
            }
          }
        },
        () => {
          // ignore scan errors
        }
      );

      if (mountedRef.current) {
        setCameraReady(true);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : 'Failed to start camera';
      let userMessage = 'Unable to access camera. Please check permissions and try again.';

      if (message.includes('Permission') || message.includes('NotAllowed') || message.includes('PermissionDenied')) {
        userMessage = 'Camera permission denied. Please allow camera access in your browser settings and try again.';
      } else if (message.includes('NotFound') || message.includes('DevicesNotFoundError') || message.includes('no camera')) {
        userMessage = 'No camera found on this device.';
      } else if (message.includes('NotReadable') || message.includes('TrackStart')) {
        userMessage = 'Camera is already in use by another application.';
      }

      setError(userMessage);
      setCameraReady(false);
    }
  }, [onScan, handleClose]);

  const requestCamera = useCallback(() => {
    setError(null);
    setImagePreview(null);
    setMode('camera');
  }, []);

  useEffect(() => {
    if (mode !== 'camera' || cameraReady) return;

    let cancelled = false;

    const initCamera = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (cancelled || !mountedRef.current) return;
      await startCamera();
    };

    initCamera();

    return () => {
      cancelled = true;
    };
  }, [mode, cameraReady, startCamera]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setImagePreview(null);
    setIsScanningFile(true);

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      setIsScanningFile(false);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    try {
      if (!fileScannerRef.current) {
        fileScannerRef.current = new Html5Qrcode('qr-reader-file');
      }

      const decodedText = await fileScannerRef.current.scanFile(file, false);
      if (!mountedRef.current) return;

      try {
        const success = await onScan(decodedText);
        if (success && mountedRef.current) {
          void handleClose();
        }
      } catch {
        if (mountedRef.current) {
          setError('This QR code is invalid or the room has expired. Please try another image.');
        }
      }
    } catch {
      if (mountedRef.current) {
        setError('No QR code found in this image. Please try another image.');
      }
    } finally {
      URL.revokeObjectURL(previewUrl);
      if (mountedRef.current) {
        setIsScanningFile(false);
      }
    }
  }, [onScan, handleClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4">
      <div className="w-full max-w-md rounded-card bg-white dark:bg-slate-800 shadow-soft border border-slate-200 dark:border-slate-700">
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
                onClick={requestCamera}
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
              <div
                id="qr-reader-camera"
                ref={cameraReaderRef}
                className="w-full overflow-hidden rounded-button min-h-[220px] flex items-center justify-center"
              >
                {!cameraReady && (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-small text-slate-600 dark:text-slate-300">Starting camera...</span>
                  </div>
                )}
              </div>
              {cameraReady && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full flex items-center justify-center gap-2 rounded-button border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-150 min-h-[52px]"
                >
                  <CameraOff className="h-5 w-5" />
                  Stop Camera
                </button>
              )}
            </div>
          )}

          {mode === 'file' && (
            <div className="flex flex-col gap-3">
              {imagePreview && (
                <div className="flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Selected QR"
                    className="max-h-[260px] rounded-button border-2 border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}
              {isScanningFile && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-small text-slate-600 dark:text-slate-300">Scanning image...</span>
                </div>
              )}
              {error && (
                <div className="rounded-button bg-error/10 border border-error/20 p-3 text-center">
                  <p className="text-small text-error font-medium">{error}</p>
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
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {error && mode !== 'file' && (
            <div className="mt-3 rounded-button bg-error/10 border border-error/20 p-3 text-center">
              <p className="text-small text-error font-medium">{error}</p>
            </div>
          )}
        </div>

        <div id="qr-reader-camera" className="hidden" />
        <div id="qr-reader-file" className="hidden" />
      </div>
    </div>
  );
}
