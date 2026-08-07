import { useEffect, useCallback, useState } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useWebRTCStats } from '../hooks/useWebRTCStats';
import { useRoom } from '../contexts/RoomContext.js';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket.js';
import PresentationScreen from '../components/presentation/PresentationScreen';
import ConnectionStatusButton from '../components/ui/ConnectionStatusButton.js';
import { LogOut } from 'lucide-react';

export default function PresentationPage() {
  const navigate = useNavigate();
  const { sessionToken, roomCode, reset } = useRoom();
  const { remoteStream, cleanup } = useWebRTC(roomCode, sessionToken);
  useWebRTCStats(remoteStream, !!remoteStream);
  const { socket, disconnect } = useSocket();

  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionEndMessage, setSessionEndMessage] = useState('');

  const handleDisconnect = useCallback(() => {
    cleanup();
    disconnect();
    reset();
    navigate('/');
  }, [cleanup, disconnect, reset, navigate]);

  const handleStopSharing = useCallback(() => {
    cleanup();
    setSessionEnded(true);
    setSessionEndMessage('The presenter stopped sharing.');
  }, [cleanup]);

  const handleDisconnectSession = useCallback(() => {
    cleanup();
    setSessionEnded(true);
    setSessionEndMessage('The presenter left the room.');
  }, [cleanup]);

  const handleConnectionLost = useCallback(() => {
    cleanup();
    setSessionEnded(true);
    setSessionEndMessage('Connection to the presenter was lost.');
  }, [cleanup]);

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

    socket.on('stop-sharing', handleStopSharing);
    socket.on('disconnect-session', handleDisconnectSession);
    socket.on('connection-lost', handleConnectionLost);

    return () => {
      socket.off('stop-sharing', handleStopSharing);
      socket.off('disconnect-session', handleDisconnectSession);
      socket.off('connection-lost', handleConnectionLost);
    };
  }, [socket, handleStopSharing, handleDisconnectSession, handleConnectionLost]);

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
        <ConnectionStatusButton connected={isConnected} />
      </div>
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ConnectionStatusButton connected={false} label="Exit" onClick={handleDisconnect} icon={<LogOut className="h-5 w-5" />} />
      </div>
      <PresentationScreen remoteStream={remoteStream} sessionEnded={sessionEnded} sessionEndMessage={sessionEndMessage} />
    </div>
  );
}
