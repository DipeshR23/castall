import { useEffect, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { getSocket } from '../services/socket.js';
import { roomService } from '../services/room.js';
import { webrtcService } from '../services/webrtc.js';

export function useWebRTC(roomCode: string | null, sessionToken: string | null) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    webrtcService.cleanup();
    setRemoteStream(null);
  }, []);

  useEffect(() => {
    console.log('[useWebRTC] effect run', { roomCode, sessionToken: sessionToken ? sessionToken.slice(0, 8) + '...' : null });
    if (!roomCode || !sessionToken) return;

    const socket = getSocket();
    console.log('[useWebRTC] socket connected:', socket.connected);

    const handleOffer = async (data: { sdp: string; sessionToken: string }) => {
      console.log('[useWebRTC] received webrtc-offer', { sessionTokenMatch: data.sessionToken === sessionToken });
      if (data.sessionToken !== sessionToken) return;

      try {
        const pc = webrtcService.createPeerConnection();
        webrtcService.setIceCandidateHandler(async (candidate: RTCIceCandidateInit) => {
          await roomService.sendIceCandidate(
            candidate.candidate || '',
            candidate.sdpMid || '',
            candidate.sdpMLineIndex || 0,
            sessionToken
          );
        });

        pc.ontrack = (event: RTCTrackEvent) => {
          console.log('[useWebRTC] ontrack fired', { streams: event.streams?.length });
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
          }
        };

        await webrtcService.setRemoteOffer(data.sdp);
        const answer = await webrtcService.createAnswer();
        console.log('[useWebRTC] created answer, sending...');
        await roomService.sendAnswer(answer.sdp || '', sessionToken);
        console.log('[useWebRTC] answer sent');
      } catch (error) {
        console.error('[useWebRTC] Failed to handle offer:', error);
        toast.error('Failed to connect to presentation');
        cleanup();
      }
    };

    const handleAnswer = async (data: { sdp: string; sessionToken: string }) => {
      console.log('[useWebRTC] received webrtc-answer', { sessionTokenMatch: data.sessionToken === sessionToken });
      if (data.sessionToken !== sessionToken) return;

      try {
        await webrtcService.setRemoteDescription(data.sdp);
        console.log('[useWebRTC] remote description set');
      } catch (error) {
        console.error('[useWebRTC] Failed to handle answer:', error);
      }
    };

    const handleIceCandidate = async (data: {
      candidate: string;
      sdpMid: string;
      sdpMLineIndex: number;
      sessionToken: string;
    }) => {
      console.log('[useWebRTC] received ice-candidate');
      if (data.sessionToken !== sessionToken) return;

      try {
        await webrtcService.addIceCandidate(
          data.candidate,
          data.sdpMid,
          data.sdpMLineIndex
        );
      } catch (error) {
        console.error('[useWebRTC] Failed to handle ICE candidate:', error);
      }
    };

    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    console.log('[useWebRTC] listeners registered');

    return () => {
      console.log('[useWebRTC] cleanup');
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      cleanup();
    };
  }, [roomCode, sessionToken, cleanup]);

  return {
    remoteStream,
    cleanup,
  };
}
