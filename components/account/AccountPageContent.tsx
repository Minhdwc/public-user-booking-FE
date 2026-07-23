'use client';

import { useQuery } from '@tanstack/react-query';
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm';
import { PaymentMethodsSection } from '@/components/account/PaymentMethodsSection';
import { ProfileForm } from '@/components/account/ProfileForm';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
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
      <PageHeader
        eyebrow="Cá nhân"
        title="Tài khoản"
        description="Quản lý hồ sơ, bảo mật và phương thức thanh toán của bạn."
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Hồ sơ</CardTitle>
          <CardDescription>Cập nhật thông tin cá nhân và ảnh đại diện</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm account={currentAccount} onUpdated={setAccount} />
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Đảm bảo mật khẩu mạnh và khác mật khẩu cũ</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <PaymentMethodsSection />
    </div>
  );
}
