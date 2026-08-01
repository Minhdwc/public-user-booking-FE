'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FavoritesPageContent } from '@/components/favorites/FavoritesPageContent';
import { NotificationsPageContent } from '@/components/notifications/NotificationsPageContent';
import {
  DeferredSheetBody,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { getVenues } from '@/lib/api/venues';
import { unwrapList } from '@/lib/api/response';
import { useFavoriteVenueIds } from '@/lib/queries/favorites.query';
import { notificationKeys } from '@/lib/queries/notification.query';
import { notificationService } from '@/lib/service';

type HeaderQuickSheet = 'favorites' | 'notifications' | null;

interface HeaderQuickSheetsProps {
  activeSheet: HeaderQuickSheet;
  onActiveSheetChange: (sheet: HeaderQuickSheet) => void;
}

export function HeaderQuickSheets({ activeSheet, onActiveSheetChange }: HeaderQuickSheetsProps) {
  const queryClient = useQueryClient();
  const favoriteVenueIds = useFavoriteVenueIds();
  const favoritesOpen = activeSheet === 'favorites';
  const notificationsOpen = activeSheet === 'notifications';
  const favoriteIdsKey = favoriteVenueIds.join(',');

  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: notificationKeys.list({}),
      queryFn: async () =>
        unwrapList(await notificationService.getNotifications({ limit: 50 })),
    });

    if (favoriteVenueIds.length === 0) return;

    void queryClient.prefetchQuery({
      queryKey: ['venues', 'favorites', favoriteVenueIds],
      queryFn: () => getVenues({ limit: 100 }),
    });
  }, [queryClient, favoriteIdsKey, favoriteVenueIds]);

  return (
    <>
      <Sheet
        open={favoritesOpen}
        onOpenChange={(open) => onActiveSheetChange(open ? 'favorites' : null)}
      >
        <SheetContent side="right" className="gap-0 p-0">
          <SheetHeader>
            <SheetTitle>Yêu thích</SheetTitle>
            <SheetDescription>Cơ sở bạn đã lưu để xem lại nhanh.</SheetDescription>
          </SheetHeader>
          <DeferredSheetBody open={favoritesOpen}>
            <FavoritesPageContent variant="sheet" active={favoritesOpen} />
          </DeferredSheetBody>
        </SheetContent>
      </Sheet>

      <Sheet
        open={notificationsOpen}
        onOpenChange={(open) => onActiveSheetChange(open ? 'notifications' : null)}
      >
        <SheetContent side="right" className="gap-0 p-0">
          <SheetHeader>
            <SheetTitle>Thông báo</SheetTitle>
            <SheetDescription>Cập nhật đặt sân và tài khoản của bạn.</SheetDescription>
          </SheetHeader>
          <DeferredSheetBody open={notificationsOpen}>
            <NotificationsPageContent variant="sheet" active={notificationsOpen} />
          </DeferredSheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}

export type { HeaderQuickSheet };
