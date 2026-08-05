import { useRef, useEffect } from 'react';

interface RemoteDisplayProps {
  stream: MediaStream | null;
}

export default function RemoteDisplay({ stream }: RemoteDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
  }, [stream]);

  return (
    <div className="absolute inset-0 bg-slate-900">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 h-full w-full"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
