import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Globe, LayoutGrid, Mail, MapPinned, Phone } from 'lucide-react';
import logoSquare from '@/assets/logo/logo-9-9.png';

export function Footer() {
  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src={logoSquare}
              alt="Minh Đức Booking Sport"
              className="size-9 object-cover"
              priority
            />
            <span className="text-lg font-bold">Minh Đức Booking Sport</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
            Nền tảng đặt sân thể thao cao cấp — tìm sân, xem lịch trống, giữ chỗ và thanh toán nhanh
            trong vài bước.
          </p>
          <div className="mt-6 flex gap-3">
            {[Globe, Mail, Phone].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="inline-flex size-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-primary-foreground/80 transition-colors hover:bg-white/10"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-white">Khám phá</p>
          <ul className="mt-5 space-y-3 text-sm text-primary-foreground/70">
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

        <div className="md:col-span-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-white">Liên hệ</p>
          <ul className="mt-5 space-y-3 text-sm text-primary-foreground/70">
            <li className="inline-flex items-center gap-2">
              <Mail className="size-3.5 shrink-0" />
              contact@minhducbooking.vn
            </li>
            <li className="inline-flex items-center gap-2">
              <Phone className="size-3.5 shrink-0" />
              +84 123 456 789
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPinned className="size-3.5 shrink-0" />
              TP. Hồ Chí Minh, Việt Nam
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Minh Đức Booking Sport. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white">
              Chính sách bảo mật
            </Link>
            <Link href="#" className="hover:text-white">
              Điều khoản dịch vụ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
