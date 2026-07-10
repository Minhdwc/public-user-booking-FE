'use client';

import { useRef, useState } from 'react';
import { Upload, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { uploadFile } from '@/lib/api/uploads';
import { ApiError } from '@/lib/api/errors';
import { ALLOWED_IMAGE_TYPES, MAX_AVATAR_SIZE } from '@/lib/validations/account';
import { cn } from '@/lib/utils';

interface AvatarUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function AvatarUploader({ value, onChange, disabled }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      toast.error('Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP');
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('Ảnh không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFile(file, 'avatars');
      onChange(result.url);
      toast.success('Tải ảnh lên thành công');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Không thể tải ảnh lên';
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-muted',
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <User className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Đang tải lên...' : 'Chọn ảnh đại diện'}
        </Button>
        <p className="text-xs text-muted-foreground">JPEG, PNG, WebP — tối đa 5MB</p>
      </div>
    </div>
  );
}
