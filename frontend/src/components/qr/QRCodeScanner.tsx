import { useEffect, useRef, useState, useCallback, useId } from 'react';
import { Camera, Image, CameraOff, Upload, Loader2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRCodeScannerProps {
  onScan: (code: string) => Promise<boolean>;
  onClose: () => void;
}

type ScanMode = 'idle' | 'camera' | 'file';

export default function QRCodeScanner({ onScan, onClose }: QRCodeScannerProps) {
  const scannerId = useId();
  const cameraId = `qr-reader-camera-${scannerId}`;
  const fileId = `qr-reader-file-${scannerId}`;
  const [mode, setMode] = useState<ScanMode>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isScanningFile, setIsScanningFile] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraReaderRef = useRef<HTMLDivElement>(null);
  const cameraScannerRef = useRef<Html5Qrcode | null>(null);
  const fileScannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);
  const onScanRef = useRef(onScan);
  const handleCloseRef = useRef(onClose);
  const cameraStartingRef = useRef(false);
  const cameraStartedRef = useRef(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    handleCloseRef.current = onClose;
  }, [onClose]);

  const stopCamera = useCallback(async () => {
    if (cameraStartedRef.current && cameraScannerRef.current) {
      try {
        await cameraScannerRef.current.stop();
      } catch {
        // ignore stop errors
      }
      try {
        cameraScannerRef.current.clear();
      } catch {
        // ignore clear errors
      }
      cameraScannerRef.current = null;
    }
    if (mountedRef.current) {
      setCameraReady(false);
    }
    cameraStartingRef.current = false;
    cameraStartedRef.current = false;
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
      setScanSuccess(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      void stopCamera();
      cleanupFileScanner();
      cameraStartingRef.current = false;
    };
  }, [stopCamera, cleanupFileScanner]);

  const handleClose = useCallback(async () => {
    await stopCamera();
    cleanupFileScanner();
    handleCloseRef.current();
  }, [stopCamera, cleanupFileScanner]);

  const startCamera = useCallback(async () => {
    if (cameraStartingRef.current) return;
    cameraStartingRef.current = true;

    setError(null);
    setScanSuccess(false);
    setCameraReady(false);

    if (!cameraReaderRef.current) {
      setError('Scanner container not ready. Please try again.');
      cameraStartingRef.current = false;
      return;
    }

    try {
      if (!cameraScannerRef.current) {
        cameraScannerRef.current = new Html5Qrcode(cameraId);
      }

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setError('No camera found on this device.');
        cameraStartingRef.current = false;
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
            const success = await onScanRef.current(decodedText);
            if (success && mountedRef.current) {
              setScanSuccess(true);
              await stopCamera();
              setTimeout(() => {
                if (mountedRef.current) {
                  handleCloseRef.current();
                }
              }, 300);
            }
          } catch (err) {
            if (mountedRef.current) {
              const message = err instanceof Error ? err.message : 'Failed to connect';
              if (message.includes('expired') || message.includes('not found') || message.includes('invalid')) {
                setError(message);
              } else {
                setError('Failed to connect. Please try again.');
              }
            }
          }
        },
        () => {
          // ignore continuous scan errors
        }
      );

      if (mountedRef.current) {
        setCameraReady(true);
        cameraStartedRef.current = true;
      }
      cameraStartingRef.current = false;
    } catch (err) {
      cameraStartingRef.current = false;
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
  }, [stopCamera, cameraId]);

  useEffect(() => {
    if (mode !== 'camera') {
      if (cameraStartedRef.current) {
        void stopCamera();
      }
    }
  }, [mode, stopCamera]);

  const requestCamera = useCallback(() => {
    setError(null);
    setImagePreview(null);
    setScanSuccess(false);
    setMode('camera');
  }, []);

  useEffect(() => {
    if (mode !== 'camera') return;

    let cancelled = false;

    const initCamera = async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (cancelled || !mountedRef.current) return;
      await startCamera();
    };

    initCamera();

    return () => {
      cancelled = true;
    };
  }, [mode, startCamera]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setImagePreview(null);
    setScanSuccess(false);
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
        fileScannerRef.current = new Html5Qrcode(fileId);
      }

      const decodedText = await fileScannerRef.current.scanFile(file, false);
      if (!mountedRef.current) return;

      try {
        const success = await onScanRef.current(decodedText);
        if (success && mountedRef.current) {
          setScanSuccess(true);
          setTimeout(() => {
            if (mountedRef.current) {
              handleCloseRef.current();
            }
          }, 300);
        }
      } catch (err) {
        if (mountedRef.current) {
          const message = err instanceof Error ? err.message : 'Failed to connect';
          setError(message);
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
  }, [fileId]);

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
                <Camera className="h-5 w-5 sm:h-6 sm:w-6" />
                Scan with Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-button border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-150 min-h-[52px]"
              >
                <Image className="h-5 w-5 sm:h-6 sm:w-6" />
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
                id={cameraId}
                ref={cameraReaderRef}
                className="w-full overflow-hidden rounded-button min-h-[220px] flex items-center justify-center"
              >
                {!cameraReady && !error && (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-small text-slate-600 dark:text-slate-300">Starting camera...</span>
                  </div>
                )}
              </div>

              {scanSuccess && (
                <div className="rounded-button bg-success/10 border border-success/20 p-3 text-center">
                  <p className="text-small text-success font-medium">QR Code scanned successfully! Connecting...</p>
                </div>
              )}

              {error && !scanSuccess && (
                <div className="rounded-button bg-error/10 border border-error/20 p-3 text-center">
                  <p className="text-small text-error font-medium">{error}</p>
                </div>
              )}

              {cameraReady && !scanSuccess && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full flex items-center justify-center gap-2 rounded-button border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-150 min-h-[52px]"
                >
                  <CameraOff className="h-5 w-5 sm:h-6 sm:w-6" />
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
              {scanSuccess && (
                <div className="rounded-button bg-success/10 border border-success/20 p-3 text-center">
                  <p className="text-small text-success font-medium">QR Code scanned successfully! Connecting...</p>
                </div>
              )}
              {error && !scanSuccess && (
                <div className="rounded-button bg-error/10 border border-error/20 p-3 text-center">
                  <p className="text-small text-error font-medium">{error}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-button border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-150 min-h-[52px]"
              >
                <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
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
        </div>

        <div id={fileId} className="hidden" />
      </div>
    </div>
  );
}
