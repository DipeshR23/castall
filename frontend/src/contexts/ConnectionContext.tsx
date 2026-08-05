import { createContext, useContext, ReactNode } from 'react';

export interface ConnectionContextValue {
  connectionState: string;
  setConnectionState: (state: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const defaultValue: ConnectionContextValue = {
  connectionState: 'idle',
  setConnectionState: () => {},
  error: null,
  setError: () => {},
};

export const ConnectionContext = createContext<ConnectionContextValue>(defaultValue);

export function useConnection() {
  return useContext(ConnectionContext);
}

interface ConnectionProviderProps {
  children: ReactNode;
}

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const value: ConnectionContextValue = {
    connectionState: 'idle',
    setConnectionState: () => {},
    error: null,
    setError: () => {},
  };

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}
