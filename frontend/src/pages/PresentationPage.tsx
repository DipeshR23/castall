import { useEffect } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useWebRTCStats } from '../hooks/useWebRTCStats';
import { useRoom } from '../contexts/RoomContext.js';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket.js';
import PresentationScreen from '../components/presentation/PresentationScreen';

export default function PresentationPage() {
  const navigate = useNavigate();
  const { sessionToken, roomCode } = useRoom();
  const { remoteStream, cleanup } = useWebRTC(roomCode, sessionToken);
  useWebRTCStats(remoteStream, !!remoteStream);
  const { socket } = useSocket();

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

  useEffect(() => {
    if (!socket) return;

    const handleStopSharing = () => {
      cleanup();
      navigate('/');
    };

    socket.on('stop-sharing', handleStopSharing);

    return () => {
      socket.off('stop-sharing', handleStopSharing);
    };
  }, [socket, cleanup, navigate]);

  return (
    <PresentationScreen remoteStream={remoteStream} onDisconnect={handleDisconnect} />
  );
}
