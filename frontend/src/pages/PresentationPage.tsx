import { useEffect } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useWebRTCStats } from '../hooks/useWebRTCStats';
import { useRoom } from '../contexts/RoomContext.js';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket.js';
import PresentationScreen from '../components/presentation/PresentationScreen';
import ConnectionStatusButton from '../components/ui/ConnectionStatusButton.js';

export default function PresentationPage() {
  const navigate = useNavigate();
  const { sessionToken, roomCode, reset } = useRoom();
  const { remoteStream, cleanup } = useWebRTC(roomCode, sessionToken);
  useWebRTCStats(remoteStream, !!remoteStream);
  const { socket, disconnect } = useSocket();

  const handleDisconnect = () => {
    cleanup();
    navigate('/');
  };

  const handleExit = () => {
    cleanup();
    disconnect();
    reset();
    navigate('/');
  };

  const isConnected = !!remoteStream;

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
    <div className="relative">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
        <ConnectionStatusButton connected={isConnected} />
      </div>
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ConnectionStatusButton connected={false} label="Exit" onClick={handleExit} />
      </div>
      <PresentationScreen remoteStream={remoteStream} onDisconnect={handleDisconnect} />
    </div>
  );
}
