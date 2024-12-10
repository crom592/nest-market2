'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { useSession } from 'next-auth/react';

/**
 * The main header component of the application.
 * Contains the top navigation bar and search functionality.
 */
const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="w-full bg-white">
      {/* Top Navigation */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-[#8046F1] text-xl font-medium">
            둥지마켓
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/purchases" className="text-gray-600 hover:text-gray-900">
              공구 목록
            </Link>
            <Link href="/purchases/my" className="text-gray-600 hover:text-gray-900">
              내 공구
            </Link>
            {session ? (
              <Link href="/profile" className="text-[#8046F1] hover:text-[#6B35E8]">
                마이페이지
              </Link>
            ) : (
              <Link href="/auth/signin" className="text-[#8046F1] hover:text-[#6B35E8]">
                로그인
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Logo and Search */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="둥지마켓 로고"
              width={40}
              height={40}
            />
            <span className="text-xl font-medium">둥지마켓</span>
          </Link>
          <div className="relative flex-1 max-w-xl ml-8">
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8046F1] focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
