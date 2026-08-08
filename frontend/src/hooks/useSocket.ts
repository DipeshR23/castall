import { useState, useEffect, useCallback } from 'react';
import type { CastAllSocket } from '../types/socket.js';
import { getSocket, disconnectSocket } from '../services/socket.js';

export function useSocket() {
  const [socket, setSocket] = useState<CastAllSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const sock = getSocket();

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };
    const handleDisconnect = () => setIsConnected(false);
    const handleConnectError = (error: Error) => {
      setIsConnected(false);
      setConnectionError(error.message);
    };

    sock.on('connect', handleConnect);
    sock.on('disconnect', handleDisconnect);
    sock.on('connect_error', handleConnectError);

    if (sock.connected) {
      setIsConnected(true);
    }

    setSocket(sock);

    return () => {
      sock.off('connect', handleConnect);
      sock.off('disconnect', handleDisconnect);
      sock.off('connect_error', handleConnectError);
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
    setConnectionError(null);
  }, []);

  return { socket, isConnected, connectionError, connect, disconnect };
}
