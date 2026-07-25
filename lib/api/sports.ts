import { unwrapList } from '@/lib/api/response';
import type { ISport } from '@/lib/api/types';
import { sportService } from '@/lib/service';

export async function getSports(): Promise<ISport[]> {
  return unwrapList(await sportService.getSports({ limit: 100 }));
}
