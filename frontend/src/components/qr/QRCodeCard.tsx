import { useState, useEffect } from 'react';
import { toDataURL } from 'qrcode';

interface QRCodeCardProps {
  value: string;
  size?: number;
}

export default function QRCodeCard({ value, size = 200 }: QRCodeCardProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    toDataURL(value, { width: size, margin: 1 })
      .then((url) => {
        if (mounted) setQrUrl(url);
      })
      .catch(() => {
        if (mounted) setQrUrl('');
      });
    return () => {
      mounted = false;
    };
  }, [value, size]);

  if (!qrUrl) {
    return <div className="flex items-center justify-center" style={{ width: size, height: size }} />;
  }

  return (
    <div className="flex items-center justify-center w-full max-w-[200px] sm:max-w-[220px] md:max-w-[240px]">
      <img 
        src={qrUrl} 
        alt="QR Code" 
        width={size} 
        height={size} 
        className="rounded-qr-card w-full h-auto"
      />
    </div>
  );
}
