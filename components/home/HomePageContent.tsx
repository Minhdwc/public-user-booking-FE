'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Dumbbell,
  MapPinned,
  Navigation,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/layout/PageShell';
import { SportFilterChips } from '@/components/common/SportFilterChips';
import { VenueCard } from '@/components/venue/VenueCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getSports } from '@/lib/api/sports';
import { getRecentlyViewedVenues, getSearchSuggestions } from '@/lib/api/search';
import { getVenues } from '@/lib/api/venues';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { SearchSuggestion } from '@/lib/service/search.service';
import type { VenueWithFields } from '@/lib/api/types';

const weekdayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function todayLocalIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function next7Days() {
  const now = new Date();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    days.push({
      value: `${year}-${month}-${day}`,
      label: i === 0 ? 'Hôm nay' : weekdayLabels[date.getDay()],
      dayMonth: `${date.getDate()}/${date.getMonth() + 1}`,
    });
  }
  return days;
}

function HeroSearchBar({ onSearch }: { onSearch: (query: string, date: string) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(todayLocalIsoDate());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const days = useMemo(() => next7Days(), []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const suggestionsQuery = useQuery({
    queryKey: ['search', 'suggestions', debouncedQuery],
    queryFn: () => getSearchSuggestions(debouncedQuery, 8),
    enabled: showSuggestions,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowSuggestions(false);
    onSearch(query.trim(), date);
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    if (suggestion.type === 'venue' && suggestion.venueId) {
      router.push(`/venues/${suggestion.venueId}`);
      return;
    }
    setQuery(suggestion.label);
    onSearch(suggestion.label, date);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-4xl">
      <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-2 shadow-lg md:flex-row">
        <div className="relative flex flex-1 items-center gap-3 border-b border-border/30 px-4 py-3 md:border-b-0 md:border-r">
          <MapPinned className="size-5 shrink-0 text-primary" />
          <input
            type="text"
            value={query}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm"
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
        <div className="flex items-center gap-3 px-4 py-3 md:w-64">
          <CalendarDays className="size-5 shrink-0 text-primary" />
          <select
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full bg-transparent text-foreground outline-none"
          >
            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}, {day.dayMonth}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="submit"
          className="h-auto rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Tìm ngay
        </Button>
      </div>

      {showSuggestions && (suggestionsQuery.data?.length ?? 0) > 0 ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border/70 bg-card shadow-lg">
          {suggestionsQuery.data?.map((suggestion) => (
            <button
              key={`${suggestion.type}-${suggestion.label}-${suggestion.venueId ?? ''}`}
              type="button"
              onMouseDown={() => handleSuggestionSelect(suggestion)}
              className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-muted/60"
            >
              <div>
                <p className="font-medium text-foreground">{suggestion.label}</p>
                {suggestion.location ? (
                  <p className="text-sm text-muted-foreground">{suggestion.location}</p>
                ) : null}
              </div>
              <span className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                {suggestion.type === 'venue' ? 'Cơ sở' : 'Phổ biến'}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}

function HeroBackground() {
  return (
    <>
      <div className="absolute inset-0 hero-gradient" aria-hidden />
      <div
        className="absolute -top-20 right-0 size-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-1/3 size-80 rounded-full bg-secondary/25 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent"
        aria-hidden
      />
    </>
  );
}

function HeroShowcase() {
  return (
    <div className="relative mx-auto hidden w-full max-w-lg lg:block" aria-hidden>
      <div className="absolute inset-10 rounded-full bg-primary/10 blur-3xl" />

      <svg
        viewBox="0 0 420 420"
        className="relative mx-auto size-full max-h-96 text-primary/15 dark:text-primary/10"
        fill="none"
      >
        <rect
          x="48"
          y="48"
          width="324"
          height="324"
          rx="12"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line x1="210" y1="48" x2="210" y2="372" stroke="currentColor" strokeWidth="2" />
        <circle cx="210" cy="210" r="52" stroke="currentColor" strokeWidth="2" />
        <rect x="48" y="132" width="72" height="156" stroke="currentColor" strokeWidth="2" />
        <rect x="300" y="132" width="72" height="156" stroke="currentColor" strokeWidth="2" />
        <rect x="132" y="48" width="156" height="72" stroke="currentColor" strokeWidth="2" />
        <rect x="132" y="300" width="156" height="72" stroke="currentColor" strokeWidth="2" />
      </svg>

      <div className="absolute top-6 -left-2 surface-card flex items-center gap-3 px-4 py-3 shadow-md">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Clock3 className="size-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Khung giờ trống</p>
          <p className="text-sm font-semibold text-foreground">18:00 – 19:30</p>
        </div>
      </div>

      <div className="absolute top-1/3 -right-2 surface-card flex items-center gap-3 px-4 py-3 shadow-md">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Trophy className="size-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Nhiều môn thể thao</p>
          <p className="text-sm font-semibold text-foreground">Bóng đá, cầu lông...</p>
        </div>
      </div>

      <div className="absolute bottom-8 left-6 surface-card w-56 p-4 shadow-md">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">Đặt sân nhanh</p>
          <span className="status-badge status-confirmed">Trống</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['17:00', '18:00', '19:00'].map((slot) => (
            <div
              key={slot}
              className="rounded-xl border border-primary/20 bg-primary/5 px-2 py-2 text-center text-xs font-medium text-primary"
            >
              {slot}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomePageContent() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSessionReady = useAuthStore((state) => state.isSessionReady);

  const sportsQuery = useQuery({
    queryKey: ['sports'],
    queryFn: getSports,
  });

  const venuesQuery = useQuery({
    queryKey: ['venues', 'featured'],
    queryFn: () => getVenues({ limit: 6 }),
  });

  const recentlyViewedQuery = useQuery({
    queryKey: ['search', 'recently-viewed'],
    queryFn: getRecentlyViewedVenues,
    enabled: isSessionReady && isAuthenticated,
  });

  const handleSearch = (query: string, date: string) => {
    const q = query.trim().toLowerCase();
    const matchedSport = (sportsQuery.data ?? []).find((sport) => {
      const name = sport.name.trim().toLowerCase();
      return name === q || name.includes(q) || q.includes(name);
    });

    if (matchedSport) {
      const params = new URLSearchParams({ sport: matchedSport.id });
      if (date) params.set('date', date);
      router.push(`/fields?${params.toString()}`);
      return;
    }

    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (date) params.set('date', date);
    const qs = params.toString();
    router.push(query ? `/venues?${qs}` : date ? `/fields?date=${date}` : '/fields');
  };

  const handleSportSelect = (sportId: string | null) => {
    router.push(sportId ? `/fields?sport=${sportId}` : '/fields');
  };

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 pb-8 pt-20 md:pt-28">
        <HeroBackground />
        <PageShell className="relative z-10 py-0">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Tìm sân nhanh chóng
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Khám phá cơ sở thể thao cao cấp, so sánh giá từng sân và giữ chỗ ngay chỉ với vài
                chạm đơn giản.
              </p>

              <div className="mt-10">
                <HeroSearchBar onSearch={handleSearch} />
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button asChild className="rounded-lg px-6 py-3">
                  <Link href="/venues">
                    <Navigation className="size-4" />
                    Sân gần tôi
                  </Link>
                </Button>
                <Link
                  href="/fields"
                  className="group inline-flex items-center gap-2 font-semibold text-primary hover:underline"
                >
                  Xem danh sách đầy đủ
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <HeroShowcase />
          </div>
        </PageShell>
      </section>

      {/* Discovery */}
      <PageShell className="pt-16">
        <div className="mb-10">
          <SportFilterChips
            sports={sportsQuery.data ?? []}
            onSelect={handleSportSelect}
            isLoading={sportsQuery.isLoading}
          />
        </div>

        {recentlyViewedQuery.data && recentlyViewedQuery.data.length > 0 ? (
          <div className="mb-10">
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Đã xem gần đây</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tiếp tục khám phá các cơ sở bạn quan tâm
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentlyViewedQuery.data.map((venue: VenueWithFields) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Cơ sở nổi bật
            </h2>
            <p className="mt-1 text-muted-foreground">
              Những địa điểm được yêu thích trong khu vực của bạn
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="rounded-lg border-primary px-5 py-2 text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Link href="/venues">
              Xem tất cả
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {venuesQuery.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-80 w-full" />
            ))}
          </div>
        ) : null}

        {!venuesQuery.isLoading && venuesQuery.data?.length === 0 ? (
          <div className="border border-border/60 bg-muted/50 px-6 py-16 text-center text-muted-foreground">
            Chưa có cơ sở nào. Hãy thêm dữ liệu từ phía quản trị.
          </div>
        ) : null}

        {venuesQuery.data && venuesQuery.data.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venuesQuery.data.map((venue: VenueWithFields) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : null}
      </PageShell>
    </div>
  );
}
