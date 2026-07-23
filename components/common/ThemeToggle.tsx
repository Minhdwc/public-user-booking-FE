'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="size-10 rounded-full"
        aria-label="Đổi giao diện"
        disabled
      >
        <SunIcon className="size-4 opacity-0" />
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-10 rounded-full border-border/70 bg-card shadow-sm"
      aria-label={isDark ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
      title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </Button>
  );
}
