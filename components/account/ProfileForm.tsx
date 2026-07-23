'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AvatarUploader } from '@/components/account/AvatarUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile, type AccountMe } from '@/lib/api/account';
import { ApiError } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/stores/auth-store';
import { profileSchema, type ProfileFormValues } from '@/lib/validations/account';

interface ProfileFormProps {
  account: AccountMe;
  onUpdated: (account: AccountMe) => void;
}

export function ProfileForm({ account, onUpdated }: ProfileFormProps) {
  const updateUser = useAuthStore((state) => state.updateUser);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: account.name,
      username: account.username,
      phone: account.phone ?? '',
      avatarUrl: account.avatarUrl ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: account.name,
      username: account.username,
      phone: account.phone ?? '',
      avatarUrl: account.avatarUrl ?? '',
    });
  }, [account, reset]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      updateUser(data);
      onUpdated(data);
      reset({
        name: data.name,
        username: data.username,
        phone: data.phone ?? '',
        avatarUrl: data.avatarUrl ?? '',
      });
      toast.success('Cập nhật hồ sơ thành công');
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Không thể cập nhật hồ sơ';
      if (error instanceof ApiError && error.statusCode === 409) {
        setError('phone', { message });
        return;
      }
      toast.error(message);
    },
  });

  const avatarUrl = useWatch({ control, name: 'avatarUrl' });

  const onSubmit = (values: ProfileFormValues) => {
    const phone = values.phone.trim();
    const normalizedPhone = phone.startsWith('+84')
      ? phone
      : phone.startsWith('84')
        ? `+${phone}`
        : phone.startsWith('0')
          ? `+84${phone.slice(1)}`
          : phone;

    mutation.mutate({
      name: values.name,
      username: values.username,
      phone: normalizedPhone,
      avatarUrl: values.avatarUrl || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <AvatarUploader
        value={avatarUrl}
        onChange={(url) => setValue('avatarUrl', url, { shouldDirty: true })}
        disabled={mutation.isPending}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Họ tên</Label>
          <Input id="name" {...register('name')} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" {...register('username')} />
          {errors.username ? (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input id="phone" type="tel" {...register('phone')} />
          {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={account.email} disabled readOnly />
        </div>
      </div>

      <Button type="submit" className="rounded-lg shadow-sm" disabled={mutation.isPending || !isDirty}>
        {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
      </Button>
    </form>
  );
}
