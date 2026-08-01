'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { ProfileForm } from '@/components/account/ProfileForm';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getMe, type AccountMe } from '@/lib/api/account';

export function AccountProfilePageContent() {
  const [account, setAccount] = useState<AccountMe | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['account', 'me'],
    queryFn: getMe,
  });

  const currentAccount = account ?? data ?? null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !currentAccount) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Không thể tải thông tin tài khoản'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cá nhân"
        title="Hồ sơ cá nhân"
        description="Cập nhật thông tin cá nhân và ảnh đại diện."
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Hồ sơ</CardTitle>
          <CardDescription>Thông tin hiển thị khi bạn đặt sân</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm account={currentAccount} onUpdated={setAccount} />
        </CardContent>
      </Card>
    </div>
  );
}
