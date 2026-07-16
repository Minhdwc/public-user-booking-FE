import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthHydrator } from '@/components/providers/auth-hydrator';
import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
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
          geistSans.variable,
          geistMono.variable,
          'flex min-h-full flex-col bg-background text-foreground antialiased',
        )}
      >
        <ThemeProvider>
          <QueryProvider>
            <AuthHydrator />
            {children}
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
