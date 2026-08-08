import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import HostCard from '../components/room/HostCard';
import BackgroundEffects from '../components/presentation/BackgroundEffects.js';
import { useRoom } from '../contexts/RoomContext.js';
import { useSocket } from '../hooks/useSocket.js';
import { roomService } from '../services/room.js';

export default function HostPage() {
  const navigate = useNavigate();
  const {
    roomCode,
    status,
    isCreating,
    createRoom,
    acceptRequest,
    rejectRequest,
    setStatus,
    reset,
    expiresIn,
  } = useRoom();
  const { socket, isConnected, connectionError } = useSocket();
  const [incomingDevice, setIncomingDevice] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const statusRef = useRef(status);
  const initAttemptedRef = useRef(false);
  const creatingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const clearCreatingTimeout = useCallback(() => {
    if (creatingTimeoutRef.current) {
      clearTimeout(creatingTimeoutRef.current);
      creatingTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearCreatingTimeout();
    if (!isConnected) {
      initAttemptedRef.current = false;
      return;
    }
    if (initAttemptedRef.current) return;
    if (roomCode) return;

    initAttemptedRef.current = true;
    setInitError(null);

    let mounted = true;
    const init = async () => {
      try {
        await createRoom();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create room';
        if (mounted) {
          setInitError(message);
        }
      }
    };
    init();

    creatingTimeoutRef.current = window.setTimeout(() => {
      if (mounted && isCreating && !roomCode) {
        setInitError('Room creation is taking too long. Please check your connection and try again.');
      }
    }, 15000);

    return () => {
      mounted = false;
      clearCreatingTimeout();
    };
  }, [isConnected, createRoom, roomCode, clearCreatingTimeout, isCreating]);

  useEffect(() => {
    if (!socket) return;

    const handlePresentationRequest = (data: { deviceName: string }) => {
      setIncomingDevice(data.deviceName);
      setStatus('REQUESTED');
    };

    const handleAcceptRequest = (data: { approved: boolean }) => {
      if (data.approved) {
        setStatus('APPROVED');
      } else {
        setStatus('WAITING');
        setIncomingDevice(null);
      }
    };

    const handleStopSharing = () => {
      setStatus('WAITING');
      setIncomingDevice(null);
    };

    const handleDisconnectSession = () => {
      setStatus('WAITING');
      setIncomingDevice(null);
    };

    const handleConnectionLost = () => {
      toast.error('Connection lost.');
      setStatus('WAITING');
      setIncomingDevice(null);
    };

    socket.on('presentation-request', handlePresentationRequest);
    socket.on('accept-request', handleAcceptRequest);
    socket.on('stop-sharing', handleStopSharing);
    socket.on('disconnect-session', handleDisconnectSession);
    socket.on('connection-lost', handleConnectionLost);

    return () => {
      socket.off('presentation-request', handlePresentationRequest);
      socket.off('accept-request', handleAcceptRequest);
      socket.off('stop-sharing', handleStopSharing);
      socket.off('disconnect-session', handleDisconnectSession);
      socket.off('connection-lost', handleConnectionLost);
    };
  }, [socket, setStatus, navigate]);

  useEffect(() => {
    if (status === 'APPROVED' || status === 'STREAMING') {
      navigate('/presentation');
    }
  }, [status, navigate]);

  useEffect(() => {
    const currentStatus = statusRef.current;
    if (currentStatus === 'ENDED' || currentStatus === 'EXPIRED' || currentStatus === 'DESTROYED') {
      const timer = setTimeout(async () => {
        reset();
        await createRoom();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, reset, createRoom]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (statusRef.current === 'APPROVED' || statusRef.current === 'STREAMING' || statusRef.current === 'REQUESTED') {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleAccept = useCallback(async () => {
    try {
      await acceptRequest();
    } catch {
      setStatus('WAITING');
      setIncomingDevice(null);
    }
  }, [acceptRequest, setStatus]);

  const handleReject = useCallback(async () => {
    try {
      await rejectRequest();
      setIncomingDevice(null);
    } catch {
      // error handled in hook
    }
  }, [rejectRequest]);

  const handleReset = useCallback(async () => {
    roomService.disconnectSession();
    reset();
    initAttemptedRef.current = false;
    try {
      await createRoom();
    } catch {
      toast.error('Failed to create new room');
    }
  }, [reset, createRoom]);

  const handleRetry = useCallback(async () => {
    setInitError(null);
    clearCreatingTimeout();
    await createRoom();
  }, [createRoom, clearCreatingTimeout]);

  if (!isConnected) {
    return (
      <div className="relative flex flex-col items-center justify-center gap-4" role="status" aria-label="Connecting to server">
        <BackgroundEffects />
        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Connecting to server...</p>
          {connectionError && (
            <p className="text-xs text-error text-center max-w-md">{connectionError}</p>
          )}
        </div>
      </div>
    );
  }

  if (isCreating && !roomCode) {
    return (
      <div className="relative flex flex-col items-center justify-center gap-4" role="status" aria-label="Creating room">
        <BackgroundEffects />
        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Creating room...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="relative flex flex-col items-center justify-center gap-4 px-4" role="alert">
        <BackgroundEffects />
        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-error text-center">{initError}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover transition-all duration-150 min-h-[44px]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!roomCode || status === 'ENDED' || status === 'EXPIRED' || status === 'DESTROYED') {
    return (
      <div className="relative flex flex-col items-center justify-center gap-4" role="status" aria-label="Creating new room">
        <BackgroundEffects />
        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Creating a new room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-72px)] w-full px-[5%] py-8 sm:py-12">
      <BackgroundEffects />
      <div className="relative z-10 w-full max-w-7xl">
        <HostCard
          roomCode={roomCode}
          status={status}
          incomingDevice={incomingDevice}
          expiresIn={expiresIn}
          onAccept={handleAccept}
          onReject={handleReject}
          onReset={handleReset}
          onBack={() => navigate('/')}
        />
      </div>
    </div>
  );
}
