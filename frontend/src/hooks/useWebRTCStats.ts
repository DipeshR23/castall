import { useEffect, useRef, useState } from 'react';
import { webrtcService } from '../services/webrtc.js';

interface WebRTCStats {
  bitrate: number;
  packetLoss: number;
  rtt: number;
  frameRate: number;
  codec: string;
}

interface RTCStatsReport {
  id: string;
  type: string;
  kind?: string;
  bytesSent?: number;
  timestamp?: number;
  framesPerSecond?: number;
  currentRoundTripTime?: number;
  packetsLost?: number;
  mimeType?: string;
  state?: string;
}

export function useWebRTCStats(remoteStream: MediaStream | null, enabled: boolean = true) {
  const [stats, setStats] = useState<WebRTCStats | null>(null);
  const previousStatsRef = useRef<Map<string, RTCStatsReport>>(new Map());
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !remoteStream) {
      setStats(null);
      return;
    }

    const pc = webrtcService.getPeerConnection();
    if (!pc) return;

    const collectStats = async () => {
      try {
        const currentStats = await pc.getStats();
        const statsMap = new Map<string, RTCStatsReport>();
        let videoBitrate = 0;
        let packetLoss = 0;
        let rtt = 0;
        let frameRate = 0;
        let codec = '';

        currentStats.forEach((report) => {
          statsMap.set(report.id, report as RTCStatsReport);

          if (report.type === 'outbound-rtp' && report.kind === 'video') {
            const bytesSent = report.bytesSent || 0;
            const prevReport = previousStatsRef.current.get(report.id);
            const prevBytesSent = prevReport?.bytesSent || 0;
            const prevTimestamp = prevReport?.timestamp || report.timestamp;
            const timeDiff = (report.timestamp - prevTimestamp) / 1000;

            if (timeDiff > 0 && prevBytesSent > 0) {
              videoBitrate = ((bytesSent - prevBytesSent) * 8) / timeDiff;
            }

            frameRate = report.framesPerSecond || 0;
          }

          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            rtt = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0;
          }

          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            packetLoss = report.packetsLost || 0;
          }

          if (report.type === 'codec') {
            if (report.mimeType?.includes('video')) {
              codec = report.mimeType.replace('video/', '');
            }
          }
        });

        previousStatsRef.current = statsMap;

        setStats({
          bitrate: Math.round(videoBitrate),
          packetLoss,
          rtt: Math.round(rtt),
          frameRate: Math.round(frameRate),
          codec,
        });
      } catch (error) {
        console.error('Failed to get WebRTC stats:', error);
      }
    };

    intervalRef.current = window.setInterval(collectStats, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, remoteStream]);

  return stats;
}
