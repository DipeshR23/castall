import { useState, useEffect, useCallback } from 'react';
import type { CastAllSocket } from '../types/socket.js';
import { getSocket, disconnectSocket } from '../services/socket.js';

export function useSocket() {
  const [socket, setSocket] = useState<CastAllSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const sock = getSocket();

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
      setIsReconnecting(false);
    };
    const handleDisconnect = () => {
      setIsConnected(false);
      setIsReconnecting(false);
    };
    const handleConnectError = (error: Error) => {
      setIsConnected(false);
      setConnectionError(error.message);
      setIsReconnecting(false);
    };
    const handleReconnecting = () => {
      setIsReconnecting(true);
      setConnectionError(null);
    };
    const handleReconnected = () => {
      setIsConnected(true);
      setConnectionError(null);
      setIsReconnecting(false);
    };

    sock.on('connect', handleConnect);
    sock.on('disconnect', handleDisconnect);
    sock.on('connect_error', handleConnectError);
    sock.on('reconnecting', handleReconnecting);
    sock.on('reconnected', handleReconnected);

    if (sock.connected) {
      setIsConnected(true);
    }

    setSocket(sock);

    return () => {
      sock.off('connect', handleConnect);
      sock.off('disconnect', handleDisconnect);
      sock.off('connect_error', handleConnectError);
      sock.off('reconnecting', handleReconnecting);
      sock.off('reconnected', handleReconnected);
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
    setIsReconnecting(false);
  }, []);

  return { socket, isConnected, connectionError, isReconnecting, connect, disconnect };
}
