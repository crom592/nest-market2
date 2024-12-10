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
    <header className="w-full bg-white sticky top-0 z-50">
      {/* Top Navigation */}
      <div className="border-b">
        <div className="max-w-screen-sm mx-auto px-2 h-12 flex items-center justify-between">
          <nav className="flex items-center space-x-4">
            <Link href="/purchases" className="text-sm text-gray-600 hover:text-gray-900">
              공구 목록
            </Link>
            <Link href="/purchases/my" className="text-sm text-gray-600 hover:text-gray-900">
              내 공구
            </Link>
            {session ? (
              <Link href="/profile" className="text-sm text-[#8046F1] hover:text-[#6B35E8]">
                마이페이지
              </Link>
            ) : (
              <Link href="/auth/signin" className="text-sm text-[#8046F1] hover:text-[#6B35E8]">
                로그인
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Logo and Search */}
      <div className="max-w-screen-sm mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="둥지마켓 로고"
              width={32}
              height={32}
            />
            <span className="text-[#8046F1] text-lg font-medium">둥지마켓</span>
          </Link>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8046F1] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
