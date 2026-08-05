import { useEffect } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useWebRTCStats } from '../hooks/useWebRTCStats';
import { useRoom } from '../contexts/RoomContext.js';
import { useNavigate } from 'react-router-dom';
import PresentationScreen from '../components/presentation/PresentationScreen';

export default function PresentationPage() {
  const navigate = useNavigate();
  const { sessionToken } = useRoom();
  const { remoteStream, cleanup } = useWebRTC(sessionToken ? 'active' : null, sessionToken);
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
    <PresentationScreen remoteStream={remoteStream} onDisconnect={handleDisconnect} />
  );
}
