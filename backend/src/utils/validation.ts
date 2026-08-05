export function validateRoomCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
}

export function sanitizeDeviceName(name: string): string {
  return name.trim().slice(0, 50);
}

export function validateSessionToken(token: string): boolean {
  return /^[a-f0-9]{32}$/.test(token);
}

export function validateSDP(sdp: string): boolean {
  return typeof sdp === 'string' && sdp.length > 0 && sdp.length < 100000;
}

export function validateICECandidate(candidate: string): boolean {
  return typeof candidate === 'string' && candidate.length > 0 && candidate.length < 10000;
}
