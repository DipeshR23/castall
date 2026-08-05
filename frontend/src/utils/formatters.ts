export const formatRoomCode = (code: string): string => {
  return code.toUpperCase();
};

export const formatExpiryTime = (minutes: number): string => {
  if (minutes <= 0) return 'Expired';
  if (minutes < 1) return '< 1 min';
  return `${minutes} min`;
};
