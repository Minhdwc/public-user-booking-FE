'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock3, LayoutGrid, MapPinned, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/layout/PageShell';
import { SportFilterChips } from '@/components/common/SportFilterChips';
import { SearchBar } from '@/components/common/SearchBar';
import { VenueCard } from '@/components/venue/VenueCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getSports } from '@/lib/api/sports';
import { getVenues } from '@/lib/api/venues';

const highlights = [
  {
    icon: LayoutGrid,
    title: 'Nhiều loại sân',
    description: 'Bóng đá, cầu lông, pickleball và nhiều môn khác.',
  },
  {
    icon: Clock3,
    title: 'Giữ chỗ 15 phút',
    description: 'Chọn giờ, giữ chỗ và thanh toán ngay trong app.',
  },
  {
    icon: ShieldCheck,
    title: 'Minh bạch giá',
    description: 'Xem giá từng sân, cơ sở và khung giờ trước khi đặt.',
  },
];

export function HomePageContent() {
  const router = useRouter();

  const sportsQuery = useQuery({
    queryKey: ['sports'],
    queryFn: getSports,
  });

  const venuesQuery = useQuery({
    queryKey: ['venues', 'featured'],
    queryFn: () => getVenues({ limit: 6 }),
  });

  const handleSearch = (query: string) => {
    router.push(query ? `/venues?search=${encodeURIComponent(query)}` : '/venues');
  };

  const handleSportSelect = (sportId: string | null) => {
    router.push(sportId ? `/fields?sport=${sportId}` : '/fields');
  };

  return (
    <div className="space-y-14 pb-4">
      <section className="hero-gradient border-b border-border/60">
        <PageShell className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Đặt sân thể thao trực tuyến
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-5xl sm:leading-tight">
                Tìm sân phù hợp, đặt lịch và thanh toán trong vài phút
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                Khám phá cơ sở thể thao, so sánh giá từng sân và giữ chỗ ngay khi bạn sẵn sàng chơi.
              </p>
            </div>

            <SearchBar
              placeholder="Tìm theo tên cơ sở, khu vực..."
              onSubmit={handleSearch}
              className="mx-auto max-w-xl"
            />

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-8 shadow-sm">
                <Link href="/fields">
                  Xem danh sách sân
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full bg-card/80 px-8">
                <Link href="/venues">
                  <MapPinned className="size-4" />
                  Khám phá cơ sở
                </Link>
              </Button>
            </div>
          </div>
        </PageShell>
      </section>

      <PageShell className="py-0">
        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="surface-card p-5">
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-heading">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </PageShell>

      <PageShell className="space-y-4 py-0">
        <div>
          <h2 className="text-xl font-bold text-heading">Môn thể thao</h2>
          <p className="text-sm text-muted-foreground">Lọc nhanh theo loại hình bạn muốn chơi</p>
        </div>
        <SportFilterChips
          sports={sportsQuery.data ?? []}
          onSelect={handleSportSelect}
          isLoading={sportsQuery.isLoading}
        />
      </PageShell>

      <PageShell className="space-y-6 py-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-heading">Cơ sở nổi bật</h2>
            <p className="text-sm text-muted-foreground">Các cụm sân mới và phổ biến nhất</p>
          </div>
          <Button variant="outline" asChild className="rounded-full bg-card">
            <Link href="/venues">Xem tất cả</Link>
          </Button>
        </div>

        {venuesQuery.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/3] w-full rounded-2xl" />
            ))}
          </div>
        ) : null}

        {!venuesQuery.isLoading && venuesQuery.data?.length === 0 ? (
          <div className="surface-muted px-6 py-12 text-center text-muted-foreground">
            Chưa có cơ sở nào. Hãy thêm dữ liệu từ phía quản trị.
          </div>
        ) : null}

        {venuesQuery.data && venuesQuery.data.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venuesQuery.data.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : null}
      </PageShell>
    </div>
  );
}
