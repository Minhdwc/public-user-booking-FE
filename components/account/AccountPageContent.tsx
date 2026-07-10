'use client';

import { useQuery } from '@tanstack/react-query';
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm';
import { ProfileForm } from '@/components/account/ProfileForm';
import { ErrorState } from '@/components/common/ErrorState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getMe, type AccountMe } from '@/lib/api/account';
import { useState } from 'react';

export function AccountPageContent() {
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
        <Skeleton className="h-48 w-full" />
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
      <div>
        <h1 className="text-2xl font-bold">Tài khoản</h1>
        <p className="text-muted-foreground">Quản lý hồ sơ và bảo mật tài khoản của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ</CardTitle>
          <CardDescription>Cập nhật thông tin cá nhân và ảnh đại diện</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm account={currentAccount} onUpdated={setAccount} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Đảm bảo mật khẩu mạnh và khác mật khẩu cũ</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
