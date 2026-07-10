import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <p className="text-lg font-semibold text-primary">SportBooking</p>
          <p className="text-sm text-muted-foreground">
            Nền tảng đặt sân thể thao trực tuyến — tìm sân, xem lịch trống và đặt chỗ nhanh chóng.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">Liên kết</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/venues" className="hover:text-foreground">
                Tìm sân
              </Link>
            </li>
            <li>
              <Link href="/bookings" className="hover:text-foreground">
                Lịch đặt sân
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-foreground">
                Tài khoản
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">Liên hệ</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Email: support@sportbooking.vn</li>
            <li>Hotline: 1900 1234</li>
            <li>TP. Hồ Chí Minh, Việt Nam</li>
          </ul>
        </div>
      </div>

      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} SportBooking. All rights reserved.
      </div>
    </footer>
  );
}
