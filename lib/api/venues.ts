import { unwrapList } from '@/lib/api/response';
import type { GetVenuesParams, VenueWithFields } from '@/lib/api/types';
import { venueService } from '@/lib/service';

export async function getVenues(params: GetVenuesParams = {}): Promise<VenueWithFields[]> {
  const payload = await venueService.getVenues({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
  });
  return unwrapList(payload);
}

export async function getVenueById(id: string): Promise<VenueWithFields> {
  return venueService.getVenue(id);
}
