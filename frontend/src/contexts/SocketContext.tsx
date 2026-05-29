import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface NotificationData {
  id: string;
  title: string;
  message?: string;
  type: string;
  link?: string;
  createdAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  onlineUsers: string[];
  notifications: NotificationData[];
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('token');
    const socket = io('/ws', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('users:online', (users: string[]) => setOnlineUsers(users));

    socket.on('notification', (data: NotificationData) => {
      setNotifications((prev) => [data, ...prev].slice(0, 50));
    });

    socket.on('lead:created', (data: any) => {
      window.dispatchEvent(new CustomEvent('ws:lead:created', { detail: data }));
    });

    socket.on('lead:updated', (data: any) => {
      window.dispatchEvent(new CustomEvent('ws:lead:updated', { detail: data }));
    });

    socket.on('lead:deleted', (data: any) => {
      window.dispatchEvent(new CustomEvent('ws:lead:deleted', { detail: data }));
    });

    socket.on('lead:converted', (data: any) => {
      window.dispatchEvent(new CustomEvent('ws:lead:converted', { detail: data }));
    });

    socket.on('leads:bulk-assigned', (data: any) => {
      window.dispatchEvent(new CustomEvent('ws:leads:bulk-assigned', { detail: data }));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, onlineUsers, notifications, clearNotification, clearAllNotifications }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
