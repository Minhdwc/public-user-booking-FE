'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { SocketProvider } from '@/lib/socket/socket-context';

function getSocketUrl() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  return apiBase.replace(/\/api\/v1\/?$/, '');
}

export function SocketRealtimeProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSessionReady = useAuthStore((state) => state.isSessionReady);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const canConnect = isSessionReady && isAuthenticated && Boolean(accessToken && user);

    if (!canConnect) {
      setSocket((current) => {
        current?.disconnect();
        return null;
      });
      return;
    }

    const nextSocket = io(getSocketUrl(), {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    setSocket(nextSocket);

    const invalidateBookings = () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    };

    nextSocket.on('connect_error', () => {
      nextSocket.disconnect();
    });

    nextSocket.on('notification', (payload: { title?: string; message?: string }) => {
      const title = payload.title?.trim() || 'Thông báo mới';
      const message = payload.message?.trim();
      if (message) toast.info(title, { description: message });
      else toast.info(title);
      invalidateBookings();
      void queryClient.invalidateQueries({ queryKey: ['chat'] });
    });

    nextSocket.on('booking-status', invalidateBookings);
    nextSocket.on('booking:updated', invalidateBookings);

    return () => {
      nextSocket.removeAllListeners();
      nextSocket.disconnect();
      setSocket(null);
    };
  }, [accessToken, isAuthenticated, isSessionReady, queryClient, user]);

  return <SocketProvider value={socket}>{children}</SocketProvider>;
}
