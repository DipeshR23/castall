import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Image, CameraOff, Upload, Loader2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

type ScanMode = 'idle' | 'camera' | 'file';
type CameraStatus = 'idle' | 'starting' | 'active' | 'error';

export default function QRCodeScanner({ onScan, onClose }: QRCodeScannerProps) {
  const [mode, setMode] = useState<ScanMode>('idle');
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrReaderRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);
  const onScanRef = useRef(onScan);
  const cameraStartRequestedRef = useRef(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) {
          await html5QrCodeRef.current.stop();
        }
      } catch {
        // ignore stop errors
      }
      html5QrCodeRef.current = null;
    }
    if (!mountedRef.current) return;
    setCameraStatus('idle');
    setError(null);
    setImagePreview(null);
    setScanSuccess(false);
    cameraStartRequestedRef.current = false;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      void stopScanner();
    };
  }, [stopScanner]);

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  useEffect(() => {
    if (mode !== 'camera' || cameraStatus !== 'starting') return;
    if (cameraStartRequestedRef.current) return;
    cameraStartRequestedRef.current = true;

    let cancelled = false;

    const startCamera = async () => {
      setError(null);
      setImagePreview(null);
      setScanSuccess(false);

      await new Promise((resolve) => setTimeout(resolve, 50));

      if (cancelled || !mountedRef.current) return;

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      }

      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cancelled || !mountedRef.current) return;

        if (!cameras || cameras.length === 0) {
          setError('No camera found on this device.');
          setCameraStatus('error');
          cameraStartRequestedRef.current = false;
          return;
        }

        const backCamera = cameras.find((cam) => cam.label.toLowerCase().includes('back'))?.id || cameras[0].id;

        await html5QrCodeRef.current.start(
          backCamera,
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (!mountedRef.current) return;
            setScanSuccess(true);
            setTimeout(() => {
              if (mountedRef.current) {
                onScanRef.current(decodedText);
                void stopScanner();
              }
            }, 300);
          },
          () => {
            // ignore scan errors
          }
        );

        if (!cancelled && mountedRef.current) {
          setCameraStatus('active');
          cameraStartRequestedRef.current = false;
        }
      } catch (err) {
        if (cancelled || !mountedRef.current) return;
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
        setCameraStatus('error');
        cameraStartRequestedRef.current = false;
      }
    };

    startCamera();

    return () => {
      cancelled = true;
    };
  }, [mode, cameraStatus, stopScanner]);

  const requestCamera = useCallback(() => {
    setError(null);
    setImagePreview(null);
    setScanSuccess(false);
    setMode('camera');
    setCameraStatus('starting');
    cameraStartRequestedRef.current = false;
  }, []);

  const stopCamera = async () => {
    await stopScanner();
    setMode('idle');
    setCameraStatus('idle');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setImagePreview(null);
    setScanSuccess(false);

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setMode('file');

    try {
      let html5QrCode = html5QrCodeRef.current;
      if (!html5QrCode) {
        html5QrCode = new Html5Qrcode('qr-reader-file');
        html5QrCodeRef.current = html5QrCode;
      }

      const decodedText = await html5QrCode.scanFile(file, false);
      if (mountedRef.current) {
        setScanSuccess(true);
        setTimeout(() => {
          if (mountedRef.current) {
            onScanRef.current(decodedText);
            void stopScanner();
          }
        }, 300);
      }
    } catch {
      if (mountedRef.current) {
        setError('No QR code found in this image. Please try another image.');
      }
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
  };

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
                disabled={cameraStatus === 'starting'}
                className="w-full flex items-center justify-center gap-2 rounded-button bg-primary px-4 py-3 text-base font-semibold text-white hover:bg-primary-hover transition-all duration-150 min-h-[52px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cameraStatus === 'starting' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Requesting Camera...
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    Scan with Camera
                  </>
                )}
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
              <div id="qr-reader" ref={qrReaderRef} className="w-full overflow-hidden rounded-button" />
              {cameraStatus === 'starting' && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-small text-slate-600 dark:text-slate-300">Starting camera...</span>
                </div>
              )}
              {cameraStatus === 'active' && (
                <button
                  type="button"
                  onClick={stopCamera}
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
                <div className="relative flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Selected QR"
                    className={`max-h-[260px] rounded-button border-2 border-slate-200 dark:border-slate-700 transition-all duration-300 ${
                      scanSuccess ? 'border-success opacity-50' : ''
                    }`}
                  />
                  {scanSuccess && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-success p-3">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
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

          {scanSuccess && mode === 'camera' && (
            <div className="mt-3 rounded-button bg-success/10 border border-success/20 p-3 text-center">
              <p className="text-small text-success font-medium">QR Code detected!</p>
            </div>
          )}
        </div>

        {/* Hidden reader element for file scanning */}
        <div id="qr-reader-file" className="hidden" />
      </div>
    </div>
  );
}
