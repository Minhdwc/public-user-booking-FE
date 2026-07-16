import apiClient from '@/lib/api/client';
import { UploadFolder, UploadResponse } from '@/lib/api/types';

export const uploadService = {
  upload: (file: File, folder: UploadFolder = 'avatars') => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/uploads?folder=${folder}`, formData) as Promise<UploadResponse>;
  },
};
