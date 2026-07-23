'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Menu, User } from 'lucide-react';
import { useState } from 'react';
import logoSquare from '@/assets/logo/logo-9-9.png';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Trang chủ' },
  { href: '/fields', label: 'Sân' },
  { href: '/venues', label: 'Cơ sở' },
  { href: '/bookings', label: 'Lịch đặt' },
];

function isNavActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { logout, isLoggingOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src={logoSquare}
              alt="Minh Đức Booking Sport"
              className="size-9 rounded-md object-cover shadow-sm"
              priority
            />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Minh Đức Booking Sport
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative py-5 text-sm font-medium transition-colors',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.label}
                  {active && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isHydrated && isAuthenticated ? (
            <Button asChild variant="ghost" size="sm" className="hidden rounded-md sm:inline-flex">
              <Link href="/bookings">
                <CalendarDays className="size-4" />
                Lịch đặt
              </Link>
            </Button>
          ) : null}

          {isHydrated && isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 rounded-md border-border/70 bg-card shadow-sm"
                >
                  <span className="flex size-7 items-center justify-center overflow-hidden rounded-md bg-primary/10">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <User className="size-4 text-primary" />
                    )}
                  </span>
                  <span className="hidden max-w-32 truncate sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-md">
                <DropdownMenuItem asChild>
                  <Link href="/account">Tài khoản</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookings">Lịch đặt sân</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={isLoggingOut} onClick={() => logout()}>
                  {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="rounded-md shadow-sm">
              <Link href="/login">Đăng nhập</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-md md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Mở menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <nav className="border-t border-border/60 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-l-2 border-primary bg-primary/5 text-foreground'
                      : 'text-muted-foreground hover:bg-accent',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {isHydrated && isAuthenticated ? (
              <Link
                href="/bookings"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
              >
                <CalendarDays className="size-4" />
                Lịch đặt sân
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
