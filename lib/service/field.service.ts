import apiClient from '@/lib/api/client';
import { PaginatedResult } from '@/lib/api/response';
import { FieldListParams, IField, IFieldAvailability } from '@/lib/api/types';

export const fieldService = {
  getFields: (params?: FieldListParams) =>
    apiClient.get('/fields', { params }) as Promise<PaginatedResult<IField> | IField[]>,

  getField: (id: string) => apiClient.get(`/fields/${id}`) as Promise<IField>,

  getAvailability: (id: string, date: string) =>
    apiClient.get(`/fields/${id}/availability`, {
      params: { date },
    }) as Promise<IFieldAvailability>,
};
