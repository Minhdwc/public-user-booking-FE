'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SportFilterChips } from '@/components/common/SportFilterChips';
import { VenueCard } from '@/components/venue/VenueCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getSports } from '@/lib/api/sports';
import { getVenues } from '@/lib/api/venues';

export function HomePageContent() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const sportsQuery = useQuery({
    queryKey: ['sports'],
    queryFn: getSports,
  });

  const venuesQuery = useQuery({
    queryKey: ['venues', 'featured'],
    queryFn: () => getVenues({ limit: 6 }),
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/venues?search=${encodeURIComponent(query)}` : '/venues');
  };

  const handleSportSelect = (sportId: string | null) => {
    router.push(sportId ? `/venues?sport=${sportId}` : '/venues');
  };

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background px-6 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Tìm và đặt sân thể thao gần bạn
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Khám phá cụm sân, xem giá và thông tin chi tiết trước khi đặt lịch.
          </p>

          <form onSubmit={handleSearch} className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên cụm sân, khu vực..."
                className="pl-10"
              />
            </div>
            <Button type="submit" className="sm:w-auto">
              Tìm sân
            </Button>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Môn thể thao</h2>
          <p className="text-sm text-muted-foreground">Lọc nhanh theo loại hình thể thao</p>
        </div>
        <SportFilterChips
          sports={sportsQuery.data ?? []}
          onSelect={handleSportSelect}
          isLoading={sportsQuery.isLoading}
        />
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Cụm sân nổi bật</h2>
            <p className="text-sm text-muted-foreground">Các cụm sân mới và phổ biến</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/venues">Xem tất cả</Link>
          </Button>
        </div>

        {venuesQuery.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/3] w-full rounded-xl" />
            ))}
          </div>
        ) : null}

        {!venuesQuery.isLoading && venuesQuery.data?.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            Chưa có cụm sân nào. Hãy thêm dữ liệu từ phía quản trị hoặc seed backend.
          </p>
        ) : null}

        {venuesQuery.data && venuesQuery.data.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venuesQuery.data.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
