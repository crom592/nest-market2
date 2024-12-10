// app/page.tsx
import Image from 'next/image'
import GroupPurchaseList from './components/GroupPurchaseList'
import CategoryNav from "./components/category-nav"

export default function Home() {
  return (
    <div>
      {/* 네비게이션 바 */}
      <nav className="border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png" // 로고 이미지 필요
              alt="둥지마켓 로고"
              width={40}
              height={40}
            />
            <span className="font-bold text-xl">둥지마켓</span>
          </div>
          <button className="p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8">
        <CategoryNav />
        <GroupPurchaseList />
      </main>
    </div>
  )
}