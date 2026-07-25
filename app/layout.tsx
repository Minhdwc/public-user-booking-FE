import type { Metadata } from 'next';
import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import { AuthHydrator } from '@/components/providers/auth-hydrator';
import { QueryProvider } from '@/components/providers/query-provider';
import { SocketRealtimeProvider } from '@/components/providers/socket-realtime-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import './globals.css';
import './theme.css';

const fontSans = Be_Vietnam_Pro({
  variable: '--font-geist-sans',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
});

const fontMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Minh Đức Booking Sport — Đặt sân thể thao',
  description: 'Tìm và đặt sân thể thao trực tuyến',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={cn(
          fontSans.variable,
          fontMono.variable,
          fontSans.className,
          'flex min-h-full flex-col bg-background text-foreground antialiased',
        )}
      >
        <ThemeProvider>
          <QueryProvider>
            <AuthHydrator />
            <SocketRealtimeProvider>{children}</SocketRealtimeProvider>
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
