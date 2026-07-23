'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSports } from '@/lib/api/sports';
import { getVenues } from '@/lib/api/venues';
import type { Sport, Venue } from '@/lib/api/types';

export interface FieldFilterValues {
  search: string;
  sportId: string | null;
  venueId: string | null;
  minPrice: string;
  maxPrice: string;
  favoritesOnly: boolean;
}

export interface FieldFilterOptions {
  sports: Sport[];
  venues: Venue[];
  isLoadingSports: boolean;
  isLoadingVenues: boolean;
}

export interface FieldFilterActions {
  updateParams: (updates: Record<string, string | null>) => void;
  clearFilters: () => void;
  onSearchSubmit: (query: string) => void;
}

function findSportByQuery(query: string, sports: { id: string; name: string }[]) {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    sports.find((sport) => {
      const name = sport.name.trim().toLowerCase();
      return name === q || name.includes(q) || q.includes(name);
    }) ?? null
  );
}

export function hasActiveFieldFilters(values: FieldFilterValues) {
  return Boolean(
    values.search ||
      values.sportId ||
      values.venueId ||
      values.minPrice ||
      values.maxPrice ||
      values.favoritesOnly,
  );
}

export function useFieldFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values: FieldFilterValues = {
    search: searchParams.get('search') ?? '',
    sportId: searchParams.get('sport'),
    venueId: searchParams.get('venue'),
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    favoritesOnly: searchParams.get('favorites') === '1',
  };

  const page = Math.max(1, Number(searchParams.get('page') || '1'));

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const clearFilters = () => router.push('/fields');

  const sportsQuery = useQuery({
    queryKey: ['sports'],
    queryFn: getSports,
  });

  const venuesQuery = useQuery({
    queryKey: ['venues', 'filter-options'],
    queryFn: () => getVenues({ limit: 100 }),
  });

  useEffect(() => {
    if (!values.search.trim() || values.sportId || !sportsQuery.data?.length) return;

    const matchedSport = findSportByQuery(values.search, sportsQuery.data);
    if (!matchedSport) return;

    updateParams({
      sport: matchedSport.id,
      search: null,
      page: null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.search, values.sportId, sportsQuery.data]);

  const onSearchSubmit = (query: string) => {
    const matchedSport = findSportByQuery(query, sportsQuery.data ?? []);
    if (matchedSport) {
      updateParams({
        sport: matchedSport.id,
        search: null,
        page: null,
      });
      return;
    }
    updateParams({
      search: query || null,
      page: null,
    });
  };

  const options: FieldFilterOptions = {
    sports: sportsQuery.data ?? [],
    venues: venuesQuery.data ?? [],
    isLoadingSports: sportsQuery.isLoading,
    isLoadingVenues: venuesQuery.isLoading,
  };

  const actions: FieldFilterActions = {
    updateParams,
    clearFilters,
    onSearchSubmit,
  };

  return {
    values,
    options,
    actions,
    page,
    hasActiveFilters: hasActiveFieldFilters(values),
  };
}
