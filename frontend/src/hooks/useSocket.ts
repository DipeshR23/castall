import { useState, useEffect, useCallback } from 'react';
import type { CastAllSocket } from '../types/socket.js';
import { getSocket, disconnectSocket } from '../services/socket.js';

export function useSocket() {
  const [socket, setSocket] = useState<CastAllSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const sock = getSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    sock.on('connect', handleConnect);
    sock.on('disconnect', handleDisconnect);

    if (sock.connected) {
      setIsConnected(true);
    }

    setSocket(sock);

    return () => {
      sock.off('connect', handleConnect);
      sock.off('disconnect', handleDisconnect);
    };
  }, []);

  const connect = useCallback(() => {
    const sock = getSocket();
    if (!sock.connected) {
      sock.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setIsConnected(false);
    setSocket(null);
  }, []);

  return { socket, isConnected, connect, disconnect };
}
