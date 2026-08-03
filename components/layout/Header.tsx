'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, CalendarDays, Heart, Menu, MessageSquare, User } from 'lucide-react';
import { useState } from 'react';
import logoSquare from '@/assets/logo/logo-9-9.png';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import {
  HeaderQuickSheets,
  type HeaderQuickSheet,
} from '@/components/layout/HeaderQuickSheets';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/hooks/useAuth';
import { useNotificationUnreadCount } from '@/lib/queries/notification.query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Trang chủ' },
  { href: '/courts', label: 'Sân' },
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
  const [activeSheet, setActiveSheet] = useState<HeaderQuickSheet>(null);
  const { user, isAuthenticated, isHydrated, isSessionReady } = useAuthStore();
  const isLoggedIn = isSessionReady && isAuthenticated;
  const { logout, isLoggingOut } = useAuth();
  const unreadCountQuery = useNotificationUnreadCount();
  const unreadCount = isLoggedIn ? (unreadCountQuery.data ?? 0) : 0;

  const openSheet = (sheet: Exclude<HeaderQuickSheet, null>) => {
    setMobileOpen(false);
    setActiveSheet(sheet);
  };

  return (
    <header className="sticky top-0 z-[1100] border-b border-border/50 bg-card/85 backdrop-blur-xl shadow-xs transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative overflow-hidden rounded-xl shadow-xs transition-transform duration-300 group-hover:scale-105">
              <Image
                src={logoSquare}
                alt="Minh Đức Booking Sport"
                className="size-10 object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="hidden text-base font-bold tracking-tight text-foreground sm:inline group-hover:text-primary transition-colors">
                Minh Đức <span className="text-primary font-extrabold">Sport</span>
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
                Sân tập & Đặt lịch 24/7
              </span>
              <span className="text-sm font-bold tracking-tight text-foreground sm:hidden">
                MĐ Sport
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-primary/10 text-primary font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isHydrated && isLoggedIn ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hidden rounded-full font-medium sm:inline-flex hover:bg-emerald-500/10 hover:text-primary transition-colors"
                onClick={() => openSheet('favorites')}
              >
                <Heart className="size-4 text-rose-500 fill-rose-500/20" />
                Yêu thích
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="relative hidden rounded-full font-medium sm:inline-flex hover:bg-emerald-500/10 hover:text-primary transition-colors"
                onClick={() => openSheet('notifications')}
              >
                <Bell className="size-4 text-emerald-600 dark:text-emerald-400" />
                Thông báo
                {unreadCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </Button>
            </>
          ) : null}

          {isHydrated && isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 rounded-full border-border/70 bg-card/80 px-3 shadow-xs hover:border-primary/40 transition-all"
                >
                  <span className="flex size-7 items-center justify-center overflow-hidden rounded-full bg-primary/15">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <User className="size-4 text-primary" />
                    )}
                  </span>
                  <span className="hidden max-w-32 truncate text-sm font-semibold sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-lg">
                <DropdownMenuItem asChild>
                  <Link href="/account/profile">Hồ sơ cá nhân</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/change-password">Đổi mật khẩu</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account">Tài khoản</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/messages">Tin nhắn</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    openSheet('favorites');
                  }}
                >
                  Yêu thích
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    openSheet('notifications');
                  }}
                >
                  Thông báo
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
            <Button asChild size="sm" className="rounded-lg shadow-sm">
              <Link href="/login">Đăng nhập</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg md:hidden"
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
                    'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-l-2 border-primary bg-primary/5 text-foreground'
                      : 'text-muted-foreground hover:bg-accent',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {isHydrated && isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => openSheet('favorites')}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  <Heart className="size-4" />
                  Yêu thích
                </button>
                <button
                  type="button"
                  onClick={() => openSheet('notifications')}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  <Bell className="size-4" />
                  Thông báo
                  {unreadCount > 0 ? ` (${unreadCount})` : ''}
                </button>
                <Link
                  href="/messages"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  <MessageSquare className="size-4" />
                  Tin nhắn
                </Link>
                <Link
                  href="/bookings"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  <CalendarDays className="size-4" />
                  Lịch đặt sân
                </Link>
              </>
            ) : null}
          </div>
        </nav>
      ) : null}

      {isLoggedIn ? (
        <HeaderQuickSheets activeSheet={activeSheet} onActiveSheetChange={setActiveSheet} />
      ) : null}
    </header>
  );
}
