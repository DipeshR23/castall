import { useState, useEffect } from 'react';
import { Monitor, Square } from 'lucide-react';
import Button from '../ui/Button.js';
import { useRoom } from '../../contexts/RoomContext.js';
import { webrtcService } from '../../services/webrtc.js';
import { roomService } from '../../services/room.js';
import { toast } from 'sonner';
import { getSocket } from '../../services/socket.js';
import ScreenRecommendation from './ScreenRecommendation';

type SharingStep = 'ready' | 'recommendation' | 'sharing';

export default function StartSharing() {
  const [step, setStep] = useState<SharingStep>('ready');
  const [isConnecting, setIsConnecting] = useState(false);
  const { sessionToken } = useRoom();

  useEffect(() => {
    if (!sessionToken) return;

    const socket = getSocket();

    const handleAnswer = async (data: { sdp: string; sessionToken: string }) => {
      if (data.sessionToken !== sessionToken) return;

      try {
        await webrtcService.setRemoteDescription(data.sdp);
      } catch (error) {
        console.error('[StartSharing] Failed to handle answer:', error);
      }
    };

    const handleIceCandidate = async (data: {
      candidate: string;
      sdpMid: string;
      sdpMLineIndex: number;
      sessionToken: string;
    }) => {
      if (data.sessionToken !== sessionToken) return;

      try {
        await webrtcService.addIceCandidate(
          data.candidate,
          data.sdpMid,
          data.sdpMLineIndex
        );
      } catch (error) {
        console.error('[StartSharing] Failed to handle ICE candidate:', error);
      }
    };

    socket.on('webrtc-answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.off('webrtc-answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
    };
  }, [sessionToken]);

  const startSharing = async () => {
    setStep('recommendation');
  };

  const handleContinue = async () => {
    if (!sessionToken) {
      toast.error('Session not authorized');
      return;
    }

    try {
      setIsConnecting(true);
      await webrtcService.acquireLocalStream();
      
      webrtcService.setIceCandidateHandler(async (candidate: RTCIceCandidateInit) => {
        await roomService.sendIceCandidate(
          candidate.candidate || '',
          candidate.sdpMid || '',
          candidate.sdpMLineIndex || 0,
          sessionToken
        );
      });

      webrtcService.createPeerConnection();
      const offer = await webrtcService.createOffer();
      await roomService.sendOffer(offer.sdp || '', sessionToken);
      
      setStep('sharing');
      toast.success('Screen sharing started');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start screen sharing';
      toast.error(message);
      setStep('ready');
    } finally {
      setIsConnecting(false);
    }
  };

  const stopSharing = () => {
    webrtcService.cleanup();
    roomService.stopSharing();
    setStep('ready');
  };

  if (step === 'sharing') {
    return (
      <div className="w-full rounded-card bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-soft border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center text-center">
          <div className="h-3 w-3 rounded-full bg-success mb-4 animate-pulse" />
          <h2 className="text-card-title font-semibold text-slate-900 dark:text-white mb-2">Sharing...</h2>
          <p className="text-small text-slate-500 dark:text-slate-400 mb-6">Your screen is being shared</p>
          <Button variant="danger" onClick={stopSharing} className="flex items-center gap-2">
            <Square className="h-5 w-5" />
            Stop Sharing
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'recommendation') {
    return (
      <ScreenRecommendation onContinue={handleContinue} isSelecting={isConnecting} />
    );
  }

  return (
    <div className="w-full rounded-card bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-soft border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-card-title font-semibold text-slate-900 dark:text-white mb-2">Ready to Share</h2>
        <p className="text-small text-slate-500 dark:text-slate-400 mb-6">Click the button below to start presenting</p>
        <Button onClick={startSharing} disabled={isConnecting || !sessionToken} className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Start Sharing
        </Button>
      </div>
    </div>
  );
}
