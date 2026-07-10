import apiClient from './client';
import type { FieldWithRelations } from './types';

export async function getFields(): Promise<FieldWithRelations[]> {
  return apiClient.get('/fields');
}

export async function getFieldById(id: string): Promise<FieldWithRelations> {
  return apiClient.get(`/fields/${id}`);
}
