import Link from 'next/link'
import { AuthModal } from './AuthModal'

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">둥지마켓</Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link href="/group-purchases" className="text-gray-600 hover:text-primary">공구 목록</Link></li>
            <li><Link href="/create-purchase" className="text-gray-600 hover:text-primary">공구 등록</Link></li>
            <li><Link href="/my-purchases" className="text-gray-600 hover:text-primary">내 공구</Link></li>
          </ul>
        </nav>
        <AuthModal />
      </div>
    </header>
  )
}

