'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';

function getSocketUrl() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  return apiBase.replace(/\/api\/v1\/?$/, '');
}

function getAccessToken() {
  return useAuthStore.getState().accessToken;
}

export function SocketRealtimeProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    const socket = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    const invalidateBookings = () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    };

    socket.on('notification', (payload: { title?: string; message?: string }) => {
      const title = payload.title?.trim() || 'Thông báo mới';
      const message = payload.message?.trim();
      if (message) toast.info(title, { description: message });
      else toast.info(title);
      invalidateBookings();
    });

    socket.on('booking-status', invalidateBookings);
    socket.on('booking:updated', invalidateBookings);

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, isHydrated, queryClient]);

  return children;
}
