import { useState, useEffect } from 'react';

interface QRCodeResult {
  url: string;
}

export function useQRCode(text: string, size: number = 200): QRCodeResult {
  const [result, setResult] = useState<QRCodeResult>({ url: '' });

  useEffect(() => {
    let mounted = true;
    import('qrcode')
      .then((mod) => mod.toDataURL(text, { width: size, margin: 1 }))
      .then((url) => {
        if (mounted) setResult({ url });
      })
      .catch(() => {
        if (mounted) setResult({ url: '' });
      });
    return () => {
      mounted = false;
    };
  }, [text, size]);

  return result;
}
