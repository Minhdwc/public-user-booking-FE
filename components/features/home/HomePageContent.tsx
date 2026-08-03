'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MapPinned,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/layout/PageShell';
import { SportFilterChips } from '@/components/features/common/SportFilterChips';
import { EmptyState } from '@/components/features/common/EmptyState';
import { VenueCard } from '@/components/features/venue/VenueCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getSports } from '@/lib/api/sports';
import { getRecentlyViewedVenues, getSearchSuggestions } from '@/lib/api/search';
import { getVenues } from '@/lib/api/venues';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { SearchSuggestion } from '@/lib/service/search.service';
import { ISport, IVenue } from '@/lib/api/types';
import { cn } from '@/lib/utils';

function HeroSearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

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
    onSearch(query.trim());
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    if (suggestion.type === 'venue' && suggestion.venueId) {
      router.push(`/venues/${suggestion.venueId}`);
      return;
    }
    setQuery(suggestion.label);
    onSearch(suggestion.label);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-3xl">
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-card/95 p-2 shadow-2xl backdrop-blur-xl transition-all duration-200 focus-within:border-emerald-500/60 focus-within:ring-4 focus-within:ring-emerald-500/10">
        <div className="relative flex flex-1 items-center gap-3 px-3 py-1.5">
          <MapPinned className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <input
            type="text"
            value={query}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tên sân, khu vực, môn thể thao..."
            className="w-full min-w-0 bg-transparent text-sm md:text-base font-medium text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        <Button
          type="submit"
          className="h-auto rounded-xl bg-emerald-600 px-6 sm:px-8 py-3 text-sm md:text-base font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 active:scale-95 transition-all duration-200 shrink-0 cursor-pointer text-nowrap min-h-11"
        >
          <Search className="size-4 mr-2" />
          Tìm ngay
        </Button>
      </div>

      {showSuggestions && (suggestionsQuery.data?.length ?? 0) > 0 ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-1 shadow-2xl backdrop-blur-xl">
          {suggestionsQuery.data?.map((suggestion: SearchSuggestion) => (
            <button
              key={`${suggestion.type}-${suggestion.label}-${suggestion.venueId ?? ''}`}
              type="button"
              onMouseDown={() => handleSuggestionSelect(suggestion)}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-emerald-500/10 cursor-pointer"
            >
              <div>
                <p className="font-semibold text-foreground text-sm">{suggestion.label}</p>
                {suggestion.location ? (
                  <p className="text-xs text-muted-foreground">{suggestion.location}</p>
                ) : null}
              </div>
              <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
        className="absolute -top-24 -right-12 size-96 rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-1/4 size-80 rounded-full bg-teal-400/10 blur-3xl"
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
      <div className="absolute inset-10 rounded-full bg-emerald-500/15 blur-3xl animate-pulse" />

      {/* Decorative Sport Cards Stack */}
      <div className="relative mx-auto size-full py-8">
        <div className="glass-card relative z-10 overflow-hidden rounded-3xl border border-white/30 p-6 shadow-2xl dark:border-white/10">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Trophy className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">Cơ Sở Pickleball Mỹ Đình</h4>
                <p className="text-xs text-muted-foreground">Nam Từ Liêm, Hà Nội</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              4.9 ★
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { time: '17:00', price: '120k', status: 'Còn trống' },
              { time: '18:00', price: '150k', status: 'Khung Hot' },
              { time: '19:00', price: '150k', status: 'Còn trống' },
            ].map((slot) => (
              <div
                key={slot.time}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-center transition-transform hover:scale-105"
              >
                <p className="text-xs font-extrabold text-foreground">{slot.time}</p>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {slot.price}
                </p>
                <span className="mt-1 block text-xs font-medium text-muted-foreground">
                  {slot.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Badges Positioned Without Blocking Card Content */}
        <div className="glass-card absolute -bottom-2 -left-6 z-20 flex items-center gap-3 rounded-2xl border border-white/40 p-3 shadow-xl backdrop-blur-md">
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Xác nhận tức thì</p>
            <p className="text-xs text-muted-foreground">Giữ sân thành công 100%</p>
          </div>
        </div>

        <div className="glass-card absolute -top-2 right-0 z-20 flex items-center gap-3 rounded-2xl border border-white/40 p-3 shadow-xl backdrop-blur-md">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0">
            <Zap className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Đặt sân trong 30s</p>
            <p className="text-xs text-muted-foreground">Thanh toán QR nhanh gọn</p>
          </div>
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

  const handleSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    const matchedSport = (sportsQuery.data || []).find((sport: ISport) => {
      const name = sport.name.trim().toLowerCase();
      return name === q || name.includes(q) || q.includes(name);
    });

    if (matchedSport) {
      const params = new URLSearchParams({ sport: matchedSport.id });
      router.push(`/courts?${params.toString()}`);
      return;
    }

    const params = new URLSearchParams();
    if (query) params.set('search', query);
    router.push(query ? `/venues?${params.toString()}` : '/courts');
  };

  const handleSportSelect = (sportId: string | null) => {
    router.push(sportId ? `/courts?sport=${sportId}` : '/courts');
  };

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40 pb-12 pt-16 md:pt-24">
        <HeroBackground />
        <PageShell className="relative z-10 py-0">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-xs mb-6">
                <Sparkles className="size-3.5 text-emerald-500" />
                <span>Hệ thống đặt sân thể thao số 1</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight">
                Đặt sân tập <br />
                <span className="bg-linear-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                  Nhanh chóng & Tiện lợi
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
                Tìm kiếm sân cầu lông, pickleball, bóng đá, tennis gần bạn. So sánh giá khung giờ
                trống và giữ chỗ tức thì 24/7.
              </p>

              <div className="mt-8">
                <HeroSearchBar onSearch={handleSearch} />
              </div>

              {/* Stats Bar */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border/40 pt-6">
                <div>
                  <p className="text-xl md:text-2xl font-extrabold text-foreground">100+</p>
                  <p className="text-xs text-muted-foreground">Cơ sở chất lượng</p>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-extrabold text-foreground">500+</p>
                  <p className="text-xs text-muted-foreground">Sân đấu tiêu chuẩn</p>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-extrabold text-foreground">4.9 ★</p>
                  <p className="text-xs text-muted-foreground">Đánh giá hài lòng</p>
                </div>
              </div>
            </div>

            <HeroShowcase />
          </div>
        </PageShell>
      </section>

      {/* Sport Category Quick Filter */}
      <PageShell className="pt-12">
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Chọn môn thể thao bạn muốn chơi</h2>
            <Link
              href="/courts"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="size-3" />
            </Link>
          </div>
          <SportFilterChips
            sports={sportsQuery.data ?? []}
            onSelect={handleSportSelect}
            isLoading={sportsQuery.isLoading}
          />
        </div>

        {recentlyViewedQuery.data && recentlyViewedQuery.data.length > 0 ? (
          <div className="mb-14">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                  Đã xem gần đây
                </h2>
                <p className="mt-1 text-xs md:text-sm text-muted-foreground">
                  Tiếp tục khám phá các cơ sở bạn vừa xem
                </p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentlyViewedQuery.data.map((venue: IVenue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          </div>
        ) : null}

        {/* Featured Venues */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
              Cơ sở nổi bật
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Địa điểm đặt sân nhiều nhất với chất lượng dịch vụ tốt nhất
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="rounded-xl border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white font-semibold transition-all"
          >
            <Link href="/venues">
              Xem tất cả
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>

        {venuesQuery.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-80 w-full rounded-2xl" />
            ))}
          </div>
        ) : null}

        {!venuesQuery.isLoading && venuesQuery.data?.length === 0 ? (
          <EmptyState
            title="Chưa có cơ sở nào"
            description="Hệ thống đang cập nhật danh sách cơ sở thể thao. Quay lại sau nhé."
            actionLabel="Xem danh sách sân"
            onAction={() => router.push('/courts')}
          />
        ) : null}

        {venuesQuery.data && venuesQuery.data.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venuesQuery.data.map((venue: IVenue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : null}

        {/* Why Choose Us Feature Cards */}
        <section className="mt-20 rounded-3xl border border-emerald-500/20 bg-linear-to-b from-emerald-500/5 to-transparent p-8 md:p-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Tại sao hàng ngàn người chọn Minh Đức Sport?
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground">
              Trải nghiệm dịch vụ đặt sân hiện đại, tiện lợi và đảm bảo giữ chỗ 100%.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Zap,
                title: 'Đặt sân trong 30s',
                desc: 'Thao tác đơn giản trên điện thoại hoặc máy tính, giữ chỗ ngay lập tức.',
              },
              {
                icon: ShieldCheck,
                title: 'Đảm bảo giữ sân 100%',
                desc: 'Hệ thống đồng bộ lịch tức thì với chủ cơ sở, không lo trùng lịch.',
              },
              {
                icon: CreditCard,
                title: 'Thanh toán linh hoạt',
                desc: 'Hỗ trợ quét mã QR chuyển khoản, Momo, VNPAY tiện lợi.',
              },
              {
                icon: Users,
                title: 'Cộng đồng năng động',
                desc: 'Dễ dàng tìm đối thủ, bắt cặp thi đấu và tham gia giải đấu thể thao.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="glass-card flex flex-col items-start p-6 rounded-2xl border border-border/50 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all duration-300"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 mb-4">
                  <item.icon className="size-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mt-16 overflow-hidden rounded-3xl bg-linear-to-r from-emerald-700 via-emerald-600 to-teal-700 p-8 md:p-12 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Bạn là chủ cơ sở sân thể thao?
              </h2>
              <p className="mt-3 text-emerald-100 text-sm md:text-base leading-relaxed">
                Đăng ký hợp tác ngay để quản lý lịch sân hiệu quả, gia tăng doanh thu và tiếp cận
                hàng ngàn khách hàng đặt sân mỗi ngày.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-8 py-4 shadow-lg shrink-0 transition-transform active:scale-95"
            >
              <Link href="/contact">Đăng ký hợp tác ngay</Link>
            </Button>
          </div>
        </section>
      </PageShell>
    </div>
  );
}
