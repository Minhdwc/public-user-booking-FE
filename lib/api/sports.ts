import { unwrapList } from '@/lib/api/response';
import type { Sport } from '@/lib/api/types';
import { sportService } from '@/lib/service';

export async function getSports(): Promise<Sport[]> {
  return unwrapList(await sportService.getSports({ limit: 100 }));
}
