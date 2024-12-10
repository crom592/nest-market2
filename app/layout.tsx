import { Inter } from 'next/font/google';
import MainLayout from '@/components/layout/MainLayout';
import Providers from '@/app/providers/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '둥지마켓 - 함께하는 공동구매',
  description: '함께 모여 더 좋은 가격으로 구매하는 공동구매 플랫폼',
  manifest: '/manifest.json',
  themeColor: '#8046F1',
  icons: {
    apple: '/icons/icon-192x192.png',
  },
  viewport: 'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '둥지마켓',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="둥지마켓" />
        <meta name="apple-mobile-web-app-title" content="둥지마켓" />
        <meta name="theme-color" content="#8046F1" />
      </head>
      <body className={inter.className}>
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
        </Providers>
      </body>
    </html>
  );
}
