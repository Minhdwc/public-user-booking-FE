import Link from 'next/link';
import { CalendarDays, LayoutGrid, Mail, MapPinned, Phone, Trophy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-[#141e13] text-[#ecf7e5]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Trophy className="size-4" />
            </span>
            <p className="text-lg font-bold">SportBooking</p>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#bacbb3]">
            Nền tảng đặt sân thể thao trực tuyến — tìm sân, xem lịch trống, giữ chỗ và thanh toán nhanh
            trong vài bước.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-white">Khám phá</p>
          <ul className="space-y-2.5 text-sm text-[#bacbb3]">
            <li>
              <Link href="/fields" className="inline-flex items-center gap-2 hover:text-white">
                <LayoutGrid className="size-3.5" />
                Danh sách sân
              </Link>
            </li>
            <li>
              <Link href="/venues" className="inline-flex items-center gap-2 hover:text-white">
                <MapPinned className="size-3.5" />
                Cơ sở thể thao
              </Link>
            </li>
            <li>
              <Link href="/bookings" className="inline-flex items-center gap-2 hover:text-white">
                <CalendarDays className="size-3.5" />
                Lịch đặt sân
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-white">Liên hệ</p>
          <ul className="space-y-2.5 text-sm text-[#bacbb3]">
            <li className="inline-flex items-center gap-2">
              <Mail className="size-3.5 shrink-0" />
              support@sportbooking.vn
            </li>
            <li className="inline-flex items-center gap-2">
              <Phone className="size-3.5 shrink-0" />
              1900 1234
            </li>
            <li>TP. Hồ Chí Minh, Việt Nam</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-[#8fa088] sm:px-6">
        © {new Date().getFullYear()} SportBooking. All rights reserved.
      </div>
    </footer>
  );
}
