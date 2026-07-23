'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import logoSquare from '@/assets/logo/logo-9-9.png';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api/errors';
import { useAuth } from '@/lib/hooks/useAuth';
import { buildRegisterUrl } from '@/lib/utils/auth-action';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { login, isLoggingIn, getApiErrorMessage } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values, redirectTo ?? undefined);
    } catch (error) {
      const message = getApiErrorMessage(error);
      if (error instanceof ApiError && error.statusCode === 401) {
        setError('password', { message });
      } else {
        setError('root', { message });
      }
    }
  };

  return (
    <Card className="w-full max-w-md border-border/70 shadow-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex items-center justify-center gap-2">
          <Image
            src={logoSquare}
            alt="Minh Đức Booking Sport"
            className="size-8 rounded-lg object-cover"
            priority
          />
          <span className="font-bold text-foreground">Minh Đức Booking Sport</span>
        </div>
        <CardTitle className="text-foreground">Đăng nhập</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          {errors.root ? <p className="text-sm text-destructive">{errors.root.message}</p> : null}

          <Button type="submit" className="w-full rounded-lg shadow-sm" disabled={isLoggingIn}>
            {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link
              href={buildRegisterUrl(redirectTo)}
              className="font-medium text-primary hover:underline"
            >
              Đăng ký
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
