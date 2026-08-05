export interface RTCConfiguration {
  iceServers: Array<{
    urls: string;
    username?: string;
    credential?: string;
  }>;
}

export interface MediaStreamState {
  stream: MediaStream | null;
  isSharing: boolean;
  error: string | null;
}
