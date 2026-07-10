import apiClient from './client';
import type { UploadResponse } from './types';

export type UploadFolder = 'avatars' | 'venues' | 'fields';

export async function uploadFile(file: File, folder: UploadFolder = 'avatars'): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`/uploads?folder=${folder}`, formData);
}
