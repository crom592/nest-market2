import { Inter } from 'next/font/google';
import MainLayout from '@/components/layout/MainLayout';
import Providers from '@/app/providers/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '둥지마켓 - 함께하는 공동구매',
  description: '함께 모여 더 좋은 가격으로 구매하는 공동구매 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
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
