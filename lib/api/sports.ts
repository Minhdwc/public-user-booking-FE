import apiClient from './client';
import type { Sport } from './types';

export async function getSports(): Promise<Sport[]> {
  return apiClient.get('/sports');
}
