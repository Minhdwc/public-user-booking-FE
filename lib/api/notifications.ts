import { unwrapList } from '@/lib/api/response';
import type { INotification } from '@/lib/api/types';
import { notificationService } from '@/lib/service';

export type { INotification as Notification };

export async function listNotifications(): Promise<INotification[]> {
  return unwrapList(await notificationService.getNotifications({ limit: 50 }));
}

export async function getUnreadNotificationCount(): Promise<number> {
  return (await notificationService.getUnreadCount()).count;
}

export async function markNotificationRead(id: string): Promise<INotification> {
  return notificationService.markRead(id);
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  return notificationService.markAllRead();
}
