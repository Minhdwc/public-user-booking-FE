'use client';

import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/lib/queries/notification.query';
import { cn } from '@/lib/utils';
import type { INotification } from '@/lib/api/types';

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
}

function NotificationItem({
  notification,
  onMarkRead,
  marking,
}: {
  notification: INotification;
  onMarkRead: (id: string) => void;
  marking: boolean;
}) {
  return (
    <Card
      className={cn(
        'border-border/70 shadow-sm transition-colors',
        !notification.isRead && 'border-primary/30 bg-primary/5',
      )}
    >
      <CardHeader className="space-y-1 pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{notification.title}</CardTitle>
          {!notification.isRead ? (
            <span className="status-badge status-pending shrink-0">Mới</span>
          ) : null}
        </div>
        <CardDescription>{formatNotificationTime(notification.createdAt)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        {!notification.isRead ? (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 rounded-lg"
            disabled={marking}
            onClick={() => onMarkRead(notification.id)}
          >
            Đánh dấu đã đọc
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface NotificationsPageContentProps {
  variant?: 'page' | 'sheet';
  active?: boolean;
}

export function NotificationsPageContent({
  variant = 'page',
  active = true,
}: NotificationsPageContentProps) {
  const isSheet = variant === 'sheet';
  const notificationsQuery = useNotifications(undefined, { enabled: active });
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((item: INotification) => !item.isRead).length;

  if (notificationsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (notificationsQuery.isError) {
    return (
      <ErrorState
        title="Không tải được thông báo"
        message={
          notificationsQuery.error instanceof Error
            ? notificationsQuery.error.message
            : 'Vui lòng thử lại'
        }
        onRetry={() => notificationsQuery.refetch()}
      />
    );
  }

  return (
    <div className={isSheet ? 'space-y-4' : 'space-y-6'}>
      <div className={cn('flex flex-col gap-4', !isSheet && 'sm:flex-row sm:items-end sm:justify-between')}>
        {!isSheet ? (
          <PageHeader
            eyebrow="Hộp thư"
            title="Thông báo"
            description={
              unreadCount > 0
                ? `${unreadCount} thông báo chưa đọc`
                : 'Theo dõi cập nhật đặt sân và tài khoản'
            }
          />
        ) : unreadCount > 0 ? (
          <p className="text-sm text-muted-foreground">{unreadCount} thông báo chưa đọc</p>
        ) : null}
        {unreadCount > 0 ? (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 rounded-lg self-start"
            disabled={markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="Chưa có thông báo"
          description="Thông báo về đặt sân và tài khoản sẽ hiển thị tại đây."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: INotification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              marking={markReadMutation.isPending}
              onMarkRead={(id) => markReadMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
