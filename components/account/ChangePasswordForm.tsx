'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePassword } from '@/lib/api/account';
import { ApiError } from '@/lib/api/errors';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/validations/account';

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      reset();
      toast.success('Đổi mật khẩu thành công');
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Không thể đổi mật khẩu';
      if (error instanceof ApiError && error.statusCode === 401) {
        setError('currentPassword', { message });
        return;
      }
      toast.error(message);
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
        <Input id="currentPassword" type="password" {...register('currentPassword')} />
        {errors.currentPassword ? (
          <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Mật khẩu mới</Label>
        <Input id="newPassword" type="password" {...register('newPassword')} />
        {errors.newPassword ? (
          <p className="text-sm text-destructive">{errors.newPassword.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
        <Input id="confirmNewPassword" type="password" {...register('confirmNewPassword')} />
        {errors.confirmNewPassword ? (
          <p className="text-sm text-destructive">{errors.confirmNewPassword.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="rounded-full shadow-sm" disabled={mutation.isPending}>
        {mutation.isPending ? 'Đang đổi...' : 'Đổi mật khẩu'}
      </Button>
    </form>
  );
}
