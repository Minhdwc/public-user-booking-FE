'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { verifyEmail } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/errors';

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const startedRef = useRef(false);

  const verifyMutation = useMutation({
    mutationFn: () => verifyEmail(token),
  });

  useEffect(() => {
    if (!token || startedRef.current) return;
    startedRef.current = true;
    verifyMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <Card className="w-full max-w-md border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Liên kết không hợp lệ</CardTitle>
          <CardDescription>
            Thiếu mã xác minh trong URL. Kiểm tra lại email của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="rounded-lg">
            <Link href="/login">Đến trang đăng nhập</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (verifyMutation.isPending) {
    return (
      <Card className="w-full max-w-md border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Đang xác minh email...</CardTitle>
          <CardDescription>Vui lòng đợi trong giây lát.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (verifyMutation.isError) {
    const message =
      verifyMutation.error instanceof ApiError
        ? verifyMutation.error.message
        : 'Không thể xác minh email';

    return (
      <Card className="w-full max-w-md border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Xác minh thất bại</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="rounded-lg">
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-lg">
            <Link href="/register">Đăng ký lại</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Email đã được xác minh</CardTitle>
      </CardHeader>
      <CardContent>
        <Button asChild className="rounded-lg">
          <Link href="/login">Đăng nhập</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
