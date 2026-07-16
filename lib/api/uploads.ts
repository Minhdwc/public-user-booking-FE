import type { UploadFolder, UploadResponse } from '@/lib/api/types';
import { uploadService } from '@/lib/service';

export type { UploadFolder };

export async function uploadFile(
  file: File,
  folder: UploadFolder = 'avatars',
): Promise<UploadResponse> {
  return uploadService.upload(file, folder);
}
