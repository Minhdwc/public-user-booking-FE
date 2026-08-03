import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Globe, LayoutGrid, Mail, MapPinned, Phone } from 'lucide-react';
import logoSquare from '@/assets/logo/logo-9-9.png';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-emerald-500/20 bg-linear-to-b from-[#09110a] via-[#050b06] to-[#020503] text-zinc-200">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={logoSquare}
              alt="Minh Đức Booking Sport"
              className="size-10 rounded-2xl object-cover shadow-md"
              priority
            />
            <span className="text-xl font-extrabold tracking-tight text-white">
              Minh Đức <span className="text-emerald-400">Sport</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
            Nền tảng đặt sân thể thao số 1 — Tìm sân dễ dàng, xem khung giờ trống trực quan, giữ chỗ tức thì và thanh toán linh hoạt trong vài thao tác.
          </p>
          <div className="mt-6 flex gap-3">
            {[
              { icon: Globe, label: 'Website' },
              { icon: Mail, label: 'Email' },
              { icon: Phone, label: 'Hotline' },
            ].map((item, index) => (
              <a
                key={index}
                href="#"
                title={item.label}
                className="inline-flex size-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-zinc-300 transition-all hover:border-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-400 hover:scale-105"
              >
                <item.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Khám phá dịch vụ</p>
          <ul className="mt-5 space-y-3 text-sm text-zinc-400">
            <li>
              <Link href="/courts" className="inline-flex items-center gap-2 transition-colors hover:text-emerald-300">
                <LayoutGrid className="size-4 text-emerald-500" />
                Danh sách sân thể thao
              </Link>
            </li>
            <li>
              <Link href="/venues" className="inline-flex items-center gap-2 transition-colors hover:text-emerald-300">
                <MapPinned className="size-4 text-emerald-500" />
                Hệ thống cơ sở
              </Link>
            </li>
            <li>
              <Link href="/bookings" className="inline-flex items-center gap-2 transition-colors hover:text-emerald-300">
                <CalendarDays className="size-4 text-emerald-500" />
                Lịch đã đặt
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Liên hệ & Hỗ trợ</p>
          <ul className="mt-5 space-y-3.5 text-sm text-zinc-400">
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-emerald-500" />
              <span>contact@minhducbooking.vn</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-emerald-500" />
              <span>+84 123 456 789 (Support 24/7)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPinned className="size-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-zinc-400 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Minh Đức Booking Sport. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-6">
            <Link href="#" className="transition-colors hover:text-emerald-400">
              Chính sách bảo mật
            </Link>
            <Link href="#" className="transition-colors hover:text-emerald-400">
              Điều khoản sử dụng
            </Link>
            <Link href="#" className="transition-colors hover:text-emerald-400">
              Hướng dẫn đặt sân
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
