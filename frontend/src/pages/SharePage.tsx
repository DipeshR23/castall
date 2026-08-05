import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import JoinCard from '../components/room/JoinCard';
import WaitingForApproval from '../components/room/WaitingForApproval';
import StartSharing from '../components/presentation/StartSharing';
import { useRoom } from '../contexts/RoomContext.js';
import { useSocket } from '../hooks/useSocket.js';

type ShareStep = 'join' | 'waiting' | 'sharing';

export default function SharePage() {
  const { setStatus, setDeviceName, setSessionToken, joinRoom, isJoining } = useRoom();
  const { socket } = useSocket();
  const [localDeviceName, setLocalDeviceName] = useState('');
  const [step, setStep] = useState<ShareStep>('join');

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

  const handleConnect = async (roomCode: string) => {
    try {
      const name = localDeviceName.trim() || 'Unknown Device';
      setDeviceName(name);
      await joinRoom(roomCode, name);
      setStep('waiting');
    } catch {
      setStep('join');
    }
  };

  if (step === 'waiting') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)] px-[5%] py-8 sm:py-12">
        <div className="w-full max-w-7xl">
          <WaitingForApproval />
        </div>
      </div>
    );
  }

  if (step === 'sharing') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)] px-[5%] py-8 sm:py-12">
        <div className="w-full max-w-7xl">
          <StartSharing />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-72px)] px-[5%] py-8 sm:py-12">
      <div className="w-full max-w-7xl">
        <JoinCard
          onConnect={handleConnect}
          deviceName={localDeviceName}
          onDeviceNameChange={setLocalDeviceName}
          isJoining={isJoining}
        />
      </div>
    </div>
  );
}
