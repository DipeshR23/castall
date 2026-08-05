import QRCodeCard from './QRCodeCard.js';

interface QRCodeCardWithCodeProps {
  roomCode: string;
}

export default function QRCodeCardWithCode({ roomCode }: QRCodeCardWithCodeProps) {
  const qrValue = `${window.location.origin}/share?room=${roomCode}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <QRCodeCard value={qrValue} />
    </div>
  );
}
