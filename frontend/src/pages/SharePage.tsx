import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import JoinCard from '../components/room/JoinCard';
import WaitingForApproval from '../components/room/WaitingForApproval';
import StartSharing from '../components/presentation/StartSharing';
import BackgroundEffects from '../components/presentation/BackgroundEffects.js';
import ConnectionStatusButton from '../components/ui/ConnectionStatusButton.js';
import { useRoom } from '../contexts/RoomContext.js';
import { useSocket } from '../hooks/useSocket.js';
import { useNavigate } from 'react-router-dom';
import { webrtcService } from '../services/webrtc.js';
import { roomService } from '../services/room.js';
import { LogOut } from 'lucide-react';

type ShareStep = 'join' | 'waiting' | 'sharing';

export default function SharePage() {
  const navigate = useNavigate();
  const { setStatus, setSessionToken, isJoining, reset } = useRoom();
  const { socket, disconnect } = useSocket();
  const [localDeviceName, setLocalDeviceName] = useState('');
  const [step, setStep] = useState<ShareStep>('join');

  const isConnected = step === 'waiting' || step === 'sharing';

  const handleExit = () => {
    webrtcService.cleanup();
    roomService.stopSharing();
    roomService.disconnectSession();
    disconnect();
    reset();
    navigate('/');
  };

  useEffect(() => {
    if (!socket) return;

    const handleAcceptRequest = (data: { approved: boolean; sessionToken?: string }) => {
      if (data.approved && data.sessionToken) {
        setSessionToken(data.sessionToken);
        setStep('sharing');
      } else {
        setStep('join');
        setStatus('IDLE');
        setSessionToken(null);
      }
    };

    const handleStopSharing = () => {
      setStep('join');
      setStatus('IDLE');
      setSessionToken(null);
    };

    const handleDisconnectSession = () => {
      setStep('join');
      setStatus('IDLE');
      setSessionToken(null);
    };

    const handleConnectionLost = () => {
      toast.error('Connection lost.');
      setStep('join');
      setStatus('IDLE');
      setSessionToken(null);
    };

    socket.on('accept-request', handleAcceptRequest);
    socket.on('stop-sharing', handleStopSharing);
    socket.on('disconnect-session', handleDisconnectSession);
    socket.on('connection-lost', handleConnectionLost);

    return () => {
      socket.off('accept-request', handleAcceptRequest);
      socket.off('stop-sharing', handleStopSharing);
      socket.off('disconnect-session', handleDisconnectSession);
      socket.off('connection-lost', handleConnectionLost);
    };
  }, [socket, setStatus, setSessionToken]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (step === 'sharing' || step === 'waiting') {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step]);

  if (step === 'waiting') {
    return (
      <div className="relative flex items-center justify-center min-h-[calc(100vh-72px)] px-[5%] py-8 sm:py-12">
        <BackgroundEffects />
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
          <ConnectionStatusButton connected={isConnected} />
        </div>
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
          <ConnectionStatusButton connected={false} label="Exit" onClick={handleExit} icon={<LogOut className="h-5 w-5" />} hoverable />
        </div>
        <div className="relative z-10 w-full max-w-7xl">
          <WaitingForApproval />
        </div>
      </div>
    );
  }

  if (step === 'sharing') {
    return (
      <div className="relative flex items-center justify-center min-h-[calc(100vh-72px)] px-[5%] py-8 sm:py-12">
        <BackgroundEffects />
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
          <ConnectionStatusButton connected={isConnected} />
        </div>
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
          <ConnectionStatusButton connected={false} label="Exit" onClick={handleExit} icon={<LogOut className="h-5 w-5" />} hoverable />
        </div>
        <div className="relative z-10 w-full max-w-7xl">
          <StartSharing />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-72px)] px-[5%] py-8 sm:py-12">
      <BackgroundEffects />
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <ConnectionStatusButton connected={isConnected} />
      </div>
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ConnectionStatusButton connected={false} label="Exit" onClick={handleExit} icon={<LogOut className="h-5 w-5" />} hoverable />
      </div>
      <div className="w-full max-w-7xl">
        <JoinCard
          deviceName={localDeviceName}
          onDeviceNameChange={setLocalDeviceName}
          isJoining={isJoining}
        />
      </div>
    </div>
  );
}

