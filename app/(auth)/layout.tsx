import { ThemeToggle } from '@/components/common/ThemeToggle';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col lg:flex-row">
      <div className="hero-gradient hidden flex-1 flex-col justify-between border-r border-border/60 p-10 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Trophy className="size-5" />
          </span>
          <span className="text-xl font-bold text-heading">SportBooking</span>
        </Link>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-heading">
            Đặt sân nhanh hơn, quản lý lịch dễ hơn
          </h2>
          <p className="text-muted-foreground">
            Một tài khoản để giữ chỗ, thanh toán và theo dõi toàn bộ lịch chơi của bạn.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">© SportBooking</p>
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
