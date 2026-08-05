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
    <div className="flex items-center justify-center bg-dark">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
