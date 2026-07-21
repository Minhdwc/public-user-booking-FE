import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AuthHydrator } from '@/components/providers/auth-hydrator';
import { QueryProvider } from '@/components/providers/query-provider';
import { SocketRealtimeProvider } from '@/components/providers/socket-realtime-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import './globals.css';
import './theme.css';

const fontSans = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const fontMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SportBooking — Đặt sân thể thao',
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
