import { createContext, useContext, ReactNode, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { roomService } from '../services/room.js';

export interface RoomContextValue {
  roomCode: string | null;
  status: string | null;
  deviceName: string | null;
  sessionToken: string | null;
  isCreating: boolean;
  isJoining: boolean;
  isAccepting: boolean;
  isRejecting: boolean;
  setRoomCode: (code: string | null) => void;
  setStatus: (status: string | null) => void;
  setDeviceName: (name: string | null) => void;
  setSessionToken: (token: string | null) => void;
  createRoom: () => Promise<{ roomCode: string; expiresIn: number }>;
  joinRoom: (code: string, name: string) => Promise<void>;
  acceptRequest: () => Promise<{ sessionToken: string }>;
  rejectRequest: () => void;
  reset: () => void;
}

const defaultValue: RoomContextValue = {
  roomCode: null,
  status: null,
  deviceName: null,
  sessionToken: null,
  isCreating: false,
  isJoining: false,
  isAccepting: false,
  isRejecting: false,
  setRoomCode: () => {},
  setStatus: () => {},
  setDeviceName: () => {},
  setSessionToken: () => {},
  createRoom: async () => ({ roomCode: '', expiresIn: 0 }),
  joinRoom: async () => {},
  acceptRequest: async () => ({ sessionToken: '' }),
  rejectRequest: () => {},
  reset: () => {},
};

export const RoomContext = createContext<RoomContextValue>(defaultValue);

export function useRoom() {
  return useContext(RoomContext);
}

interface RoomProviderProps {
  children: ReactNode;
}

export function RoomProvider({ children }: RoomProviderProps) {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const createRoom = useCallback(async () => {
    setIsCreating(true);
    try {
      const result = await roomService.createRoom();
      setRoomCode(result.roomCode);
      setStatus('WAITING');
      toast.success('Room created successfully');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create room');
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const joinRoom = useCallback(
    async (code: string, name: string) => {
      setIsJoining(true);
      try {
        await roomService.joinRoom(code, name);
        setRoomCode(code);
        setStatus('REQUESTED');
        toast.success('Joined room successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to join room');
        throw error;
      } finally {
        setIsJoining(false);
      }
    },
    []
  );

  const acceptRequest = useCallback(async () => {
    setIsAccepting(true);
    try {
      const result = await roomService.acceptRequest();
      setStatus('APPROVED');
      setSessionToken(result.sessionToken);
      toast.success('Request accepted');
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to accept request');
      throw error;
    } finally {
      setIsAccepting(false);
    }
  }, []);

  const rejectRequest = useCallback(() => {
    setIsRejecting(true);
    try {
      roomService.rejectRequest();
      setStatus('WAITING');
      toast.info('Request rejected');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject request');
    } finally {
      setIsRejecting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setRoomCode(null);
    setStatus(null);
    setDeviceName(null);
    setSessionToken(null);
  }, []);

  const value: RoomContextValue = {
    roomCode,
    status,
    deviceName,
    sessionToken,
    isCreating,
    isJoining,
    isAccepting,
    isRejecting,
    setRoomCode,
    setStatus,
    setDeviceName,
    setSessionToken,
    createRoom,
    joinRoom,
    acceptRequest,
    rejectRequest,
    reset,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}
