import { useEffect } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useWebRTCStats } from '../hooks/useWebRTCStats';
import { useRoom } from '../contexts/RoomContext.js';
import { useNavigate } from 'react-router-dom';
import PresentationScreen from '../components/presentation/PresentationScreen';
import ConnectionStatus from '../components/ui/ConnectionStatus';

export default function PresentationPage() {
  const navigate = useNavigate();
  const { sessionToken } = useRoom();
  console.log('[PresentationPage] render', { sessionToken: sessionToken ? sessionToken.slice(0, 8) + '...' : null });
  const { remoteStream, cleanup } = useWebRTC(sessionToken ? 'active' : null, sessionToken);
  console.log('[PresentationPage] remoteStream', { hasStream: !!remoteStream });
  useWebRTCStats(remoteStream, !!remoteStream);

  const handleDisconnect = () => {
    cleanup();
    navigate('/');
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (remoteStream) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [remoteStream]);

  return (
    <>
      <ConnectionStatus isConnected={!!remoteStream} />
      <PresentationScreen remoteStream={remoteStream} onDisconnect={handleDisconnect} />
    </>
  );
}
