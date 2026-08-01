'use client';

import { ChangePasswordForm } from '@/components/account/ChangePasswordForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AccountChangePasswordPageContent() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Bảo mật"
        title="Đổi mật khẩu"
        description="Đảm bảo mật khẩu mạnh và khác mật khẩu cũ."
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Mật khẩu</CardTitle>
          <CardDescription>Cập nhật mật khẩu đăng nhập của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
