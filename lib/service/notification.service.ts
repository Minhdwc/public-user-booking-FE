import apiClient from '@/lib/api/client';
import { PaginatedResult } from '@/lib/api/response';
import { INotification, ListParams } from '@/lib/api/types';

export const notificationService = {
  getNotifications: (params?: ListParams) =>
    apiClient.get('/notifications', {
      params,
    }) as Promise<PaginatedResult<INotification> | INotification[]>,

  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count') as Promise<{ count: number }>,

  markRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`) as Promise<INotification>,

  markAllRead: () =>
    apiClient.patch('/notifications/read-all') as Promise<{ success: boolean }>,
};
