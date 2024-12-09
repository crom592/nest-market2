import './globals.css'
import { Inter } from 'next/font/google'
import Header from './components/Header'
import Footer from './components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '둥지마켓',
  description: '함께 모여 더 좋은 가격에 구매하는 공동구매 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

