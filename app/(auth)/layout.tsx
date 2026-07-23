import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import logoSquare from '@/assets/logo/logo-9-9.png';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col lg:flex-row">
      <div className="hero-gradient hidden flex-1 flex-col justify-between border-r border-border/60 p-10 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src={logoSquare}
            alt="Minh Đức Booking Sport"
            className="size-10 rounded-md object-cover shadow-sm"
            priority
          />
          <span className="text-xl font-bold text-foreground">Minh Đức Booking Sport</span>
        </Link>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Đặt sân nhanh hơn, quản lý lịch dễ hơn
          </h2>
          <p className="text-muted-foreground">
            Một tài khoản để giữ chỗ, thanh toán và theo dõi toàn bộ lịch chơi của bạn.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">© Minh Đức Booking Sport</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
}
