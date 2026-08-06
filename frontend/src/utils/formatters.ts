export const formatRoomCode = (code: string): string => {
  return code.toUpperCase();
};

export const formatExpiryTime = (minutes: number): string => {
  if (minutes <= 0) return 'Expired';
  if (minutes < 1) return '< 1 min';
  return `${minutes} min`;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
