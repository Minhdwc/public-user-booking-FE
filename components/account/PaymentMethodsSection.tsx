'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api/errors';
import { unwrapList } from '@/lib/api/response';
import { CreateUserPaymentMethodPayload, IUserPaymentMethod } from '@/lib/api/types';
import { userPaymentMethodService } from '@/lib/service';

const paymentMethodKeys = {
  all: ['user-payment-methods'] as const,
};

const typeLabels: Record<IUserPaymentMethod['type'], string> = {
  bank_transfer: 'Chuyển khoản',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
  vnpay: 'VNPay',
};

function AddPaymentMethodDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateUserPaymentMethodPayload>({
    type: 'bank_transfer',
    provider: '',
    maskedNumber: '',
    holderName: '',
    isDefault: false,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPaymentMethodPayload) =>
      userPaymentMethodService.createMethod(payload),
    onSuccess: async () => {
      toast.success('Đã thêm phương thức thanh toán');
      await queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all });
      setOpen(false);
      setForm({
        type: 'bank_transfer',
        provider: '',
        maskedNumber: '',
        holderName: '',
        isDefault: false,
      });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Không thêm được phương thức');
    },
  });

  const handleSubmit = () => {
    if (!form.provider.trim()) {
      toast.error('Vui lòng nhập tên nhà cung cấp');
      return;
    }

    createMutation.mutate({
      ...form,
      provider: form.provider.trim(),
      maskedNumber: form.maskedNumber?.trim() || undefined,
      holderName: form.holderName?.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Thêm phương thức</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm phương thức thanh toán</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-type">Loại</Label>
            <select
              id="payment-type"
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  type: event.target.value as CreateUserPaymentMethodPayload['type'],
                }))
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="bank_transfer">Chuyển khoản</option>
              <option value="momo">MoMo</option>
              <option value="zalopay">ZaloPay</option>
              <option value="vnpay">VNPay</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-provider">Nhà cung cấp / Ngân hàng</Label>
            <Input
              id="payment-provider"
              value={form.provider}
              onChange={(event) => setForm((current) => ({ ...current, provider: event.target.value }))}
              placeholder="VD: Vietcombank, MoMo cá nhân"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-masked">Số tài khoản / ví (ẩn bớt)</Label>
            <Input
              id="payment-masked"
              value={form.maskedNumber ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, maskedNumber: event.target.value }))
              }
              placeholder="VD: **** 1234"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-holder">Chủ tài khoản</Label>
            <Input
              id="payment-holder"
              value={form.holderName ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, holderName: event.target.value }))
              }
              placeholder="Tên chủ tài khoản"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(form.isDefault)}
              onChange={(event) =>
                setForm((current) => ({ ...current, isDefault: event.target.checked }))
              }
            />
            Đặt làm mặc định
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Huỷ
          </Button>
          <Button disabled={createMutation.isPending} onClick={handleSubmit}>
            {createMutation.isPending ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentMethodsSection() {
  const queryClient = useQueryClient();

  const methodsQuery = useQuery({
    queryKey: paymentMethodKeys.all,
    queryFn: async () => unwrapList(await userPaymentMethodService.getMethods({ limit: 50 })),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, isDefault }: { id: string; isDefault: boolean }) =>
      userPaymentMethodService.updateMethod(id, { isDefault }),
    onSuccess: async () => {
      toast.success('Đã cập nhật phương thức mặc định');
      await queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Không cập nhật được');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userPaymentMethodService.deleteMethod(id),
    onSuccess: async () => {
      toast.success('Đã xóa phương thức thanh toán');
      await queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Không xóa được');
    },
  });

  const methods = methodsQuery.data ?? [];

  return (
    <Card className="rounded-2xl border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Phương thức thanh toán cá nhân</CardTitle>
          <CardDescription>
            Lưu thông tin thanh toán cá nhân để quản lý thuận tiện hơn (không thay thế thanh toán
            theo từng lần đặt sân).
          </CardDescription>
        </div>
        <AddPaymentMethodDialog />
      </CardHeader>
      <CardContent>
        {methodsQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : methods.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có phương thức nào. Thêm ví hoặc tài khoản ngân hàng để sử dụng sau này.
          </p>
        ) : (
          <div className="space-y-3">
            {methods.map((method) => (
              <div
                key={method.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{method.provider}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {typeLabels[method.type]}
                      </span>
                      {method.isDefault ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                          Mặc định
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {[method.maskedNumber, method.holderName].filter(Boolean).join(' · ') ||
                        'Chưa có thông tin chi tiết'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!method.isDefault ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ id: method.id, isDefault: true })}
                    >
                      <Star className="mr-1 size-3.5" />
                      Đặt mặc định
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (window.confirm('Xóa phương thức thanh toán này?')) {
                        deleteMutation.mutate(method.id);
                      }
                    }}
                  >
                    <Trash2 className="mr-1 size-3.5" />
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
