import { mapCourt } from '@/lib/api/mappers';
import { unwrapList, unwrapPage } from '@/lib/api/response';
import type { CourtListParams, ICourt, ICourtAvailability } from '@/lib/api/types';
import { courtService } from '@/lib/service';

export async function getCourts(params: CourtListParams = {}): Promise<ICourt[]> {
  return unwrapList(await courtService.getCourts(params, 100, 1)).map(mapCourt);
}

export async function getCourtsPage(params: CourtListParams = {}, limit = 12, page = 1) {
  const pageResult = unwrapPage(await courtService.getCourts(params, limit, page));
  return {
    ...pageResult,
    data: pageResult.data.map(mapCourt),
  };
}

export async function getCourtById(id: string): Promise<ICourt> {
  return mapCourt(await courtService.getCourt(id));
}

export async function getCourtAvailability(
  courtId: string,
  date: string,
): Promise<ICourtAvailability> {
  return courtService.getAvailability(courtId, date);
}
