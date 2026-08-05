import { useState } from 'react';
import { Monitor, Square } from 'lucide-react';
import Button from '../ui/Button.js';
import { useRoom } from '../../contexts/RoomContext.js';
import { webrtcService } from '../../services/webrtc.js';
import { roomService } from '../../services/room.js';
import { toast } from 'sonner';
import ScreenRecommendation from './ScreenRecommendation';

type SharingStep = 'ready' | 'recommendation' | 'sharing';

export default function StartSharing() {
  const [step, setStep] = useState<SharingStep>('ready');
  const [isConnecting, setIsConnecting] = useState(false);
  const { sessionToken } = useRoom();

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
      <div className="w-full max-w-sm rounded-card bg-surface p-8 shadow-soft border border-border">
        <div className="flex flex-col items-center text-center">
          <div className="h-3 w-3 rounded-full bg-success mb-4 animate-pulse" />
          <h2 className="text-card-title font-semibold text-heading mb-2">Sharing...</h2>
          <p className="text-small text-text-secondary mb-6">Your screen is being shared</p>
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
    <div className="w-full max-w-sm rounded-card bg-surface p-8 shadow-soft border border-border">
      <div className="flex flex-col items-center text-center">
        <Monitor className="h-12 w-12 text-primary mb-4" />
        <h2 className="text-card-title font-semibold text-heading mb-2">Ready to Share</h2>
        <p className="text-small text-text-secondary mb-6">Click the button below to start presenting</p>
        <Button onClick={startSharing} disabled={isConnecting || !sessionToken} className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Start Sharing
        </Button>
      </div>
    </div>
  );
}
